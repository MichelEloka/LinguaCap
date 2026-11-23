package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * EVO-042 : un élève mis en pause restait « actif » dans Suivi. Suivi garde l'état porté par l'événement le plus
 * récent selon occurredAt (TrackingSync.status : mise à jour seulement si status_at <= occurredAt). Apprentissage
 * horodatait ses événements avec now(), l'heure de début de la transaction : si l'horloge du serveur recule entre la
 * validation du planning et la pause (recalage de l'horloge de la machine virtuelle Docker), ou si deux transactions
 * se chevauchent, la pause reçoit une heure antérieure à la validation et Suivi l'écarte, définitivement (la
 * reconstruction trie aussi par occurredAt).
 */
class GoalEventTimeTest {
    /** Validation du planning du « suivi-pause » dans la recette verte (learning.outbox_events, séquence 97). */
    private static final OffsetDateTime VALIDATED = OffsetDateTime.of(2026, 11, 23, 14, 38, 41, 181_771_000, ZoneOffset.UTC);
    /** Objectif fixé 63 ms plus tôt, dans la transaction de l'attribution (séquence 91). */
    private static final OffsetDateTime GOAL_SET = OffsetDateTime.of(2026, 11, 23, 14, 38, 41, 118_721_000, ZoneOffset.UTC);
    /** Pause 382 ms après la validation (séquence 98), lue sur une horloge qui a reculé d'une demi-seconde entre-temps. */
    private static final OffsetDateTime PAUSE_CLOCK = VALIDATED.plus(Duration.ofMillis(382)).minus(Duration.ofMillis(500));

    /** Projection de Suivi pour un objectif, avec la même règle que TrackingSync.status. */
    private static final class Tracking {
        String status = "active";
        OffsetDateTime statusAt;

        void apply(String goalStatus, OffsetDateTime occurredAt) {
            if (statusAt == null || !statusAt.isAfter(occurredAt)) {
                status = goalStatus;
                statusAt = occurredAt;
            }
        }
    }

    /** Heures attribuées par Apprentissage aux événements d'un objectif, dans l'ordre des séquences. */
    private static List<OffsetDateTime> stamped(List<OffsetDateTime> clockReadings) {
        List<OffsetDateTime> stamps = new ArrayList<>();
        OffsetDateTime previous = null;
        for (OffsetDateTime clock : clockReadings) {
            previous = GoalRules.eventTime(previous, clock);
            stamps.add(previous);
        }
        return stamps;
    }

    @Test
    void laPauseQuiSuitLaValidationResteEnPauseDansLeSuiviMemeSiLHorlogeRecule() {
        List<OffsetDateTime> clock = List.of(GOAL_SET, VALIDATED, PAUSE_CLOCK);
        List<String> statuses = List.of("preparing", "active", "paused");

        // Avant : occurredAt = heure lue au début de chaque transaction. La pause est écartée, l'objectif reste actif.
        Tracking before = new Tracking();
        for (int index = 0; index < clock.size(); index++) before.apply(statuses.get(index), clock.get(index));
        assertEquals("active", before.status, "Le défaut observé en recette est reproduit");

        // Après : l'horloge de l'objectif place la pause juste après la validation.
        List<OffsetDateTime> stamps = stamped(clock);
        Tracking after = new Tracking();
        for (int index = 0; index < stamps.size(); index++) after.apply(statuses.get(index), stamps.get(index));
        assertEquals("paused", after.status);
        assertEquals(VALIDATED.plus(GoalRules.EVENT_TICK), stamps.get(2), "Une microseconde après la validation");
        assertEquals(List.of(GOAL_SET, VALIDATED), stamps.subList(0, 2), "Une horloge qui avance est gardée telle quelle");
    }

    @Test
    void laRepriseQuiSuitLaPauseResteActiveMemeSiSaTransactionACommenceAvant() {
        // La validation qui reprend le parcours commence (now()) avant la pause, mais n'obtient le verrou du parcours
        // qu'après elle : l'état final dans Apprentissage est « actif ». L'heure de l'événement est lue sous le verrou.
        OffsetDateTime resumeStarted = VALIDATED.plus(Duration.ofSeconds(5));
        OffsetDateTime pauseStarted = resumeStarted.plus(Duration.ofMillis(3));
        OffsetDateTime pauseEmitted = pauseStarted.plus(Duration.ofMillis(4));
        OffsetDateTime resumeEmitted = pauseEmitted.plus(Duration.ofMillis(9));

        Tracking before = new Tracking();
        before.apply("active", VALIDATED);
        before.apply("paused", pauseStarted);
        before.apply("active", resumeStarted);
        assertEquals("paused", before.status, "Avec l'heure de début de transaction, la reprise était écartée");

        List<OffsetDateTime> stamps = stamped(List.of(VALIDATED, pauseEmitted, resumeEmitted));
        Tracking after = new Tracking();
        after.apply("active", stamps.get(0));
        after.apply("paused", stamps.get(1));
        after.apply("active", stamps.get(2));
        assertEquals("active", after.status);
    }

    @Test
    void lHorlogeDUnObjectifEstStrictementCroissante() {
        assertEquals(VALIDATED, GoalRules.eventTime(null, VALIDATED), "Premier événement : l'horloge du serveur");
        OffsetDateTime later = VALIDATED.plus(Duration.ofMillis(1));
        assertTrue(PAUSE_CLOCK.isBefore(VALIDATED), "Le jeu d'essai simule bien une horloge qui recule");
        assertEquals(later, GoalRules.eventTime(VALIDATED, later));
        assertEquals(VALIDATED.plusNanos(1_000), GoalRules.eventTime(VALIDATED, VALIDATED), "Même lecture d'horloge");
        assertEquals(VALIDATED.plusNanos(1_000), GoalRules.eventTime(VALIDATED, VALIDATED.minusHours(1)), "Horloge en arrière");
        // Une heure précédente exprimée dans un autre fuseau est comparée en instant.
        OffsetDateTime paris = VALIDATED.withOffsetSameInstant(ZoneOffset.ofHours(1));
        assertTrue(GoalRules.eventTime(paris, VALIDATED.minusSeconds(2)).isEqual(VALIDATED.plusNanos(1_000)));

        // Validation, examen remis, examen corrigé, pause, reprise : lectures en désordre, heures toujours croissantes.
        OffsetDateTime ahead = VALIDATED.plus(Duration.ofMillis(200));
        List<OffsetDateTime> readings = List.of(VALIDATED, VALIDATED, VALIDATED.minus(Duration.ofMillis(400)), ahead,
                VALIDATED.minusSeconds(1));
        List<OffsetDateTime> stamps = stamped(readings);
        for (int index = 1; index < stamps.size(); index++) {
            assertTrue(stamps.get(index).isAfter(stamps.get(index - 1)), "Événement " + index + " après le précédent");
        }
        assertEquals(ahead, stamps.get(3), "L'horloge reprend la main dès qu'elle dépasse");
    }
}
