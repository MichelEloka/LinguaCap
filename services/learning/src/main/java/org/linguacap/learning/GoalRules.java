package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.linguacap.common.Cefr;
import org.linguacap.common.HttpError;
import org.linguacap.learning.Planner.Day;

/** Règles de l'objectif et des disponibilités, sans accès à la base : testées unitairement (DEV-034, DEV-038, DEV-039). */
final class GoalRules {
    /**
     * Marge de la durée conseillée : 25 % de temps en plus que le contenu prévu. Le remplissage des séances perd du temps
     * (une activité de 20 à 25 min laisse un reste inutilisable dans une séance de 30 min) et il faut absorber les
     * imprévus : avec 10 %, le B1 au rythme standard débordait de cinq séances (recette du 24/11/2026).
     */
    static final int MARGIN_PERCENT = 125;
    /** Semaines par mois en moyenne (365,25 / 12 / 7 ≈ 4,345), en millièmes pour un calcul exact en entiers. */
    static final int WEEKS_PER_MONTH_MILLI = 4345;
    /** Durées par défaut d'une version antérieure aux réglages de planification (comme le planificateur des parcours). */
    static final int DEFAULT_REVIEW_MINUTES = 10;
    static final int DEFAULT_MIDTERM_MINUTES = 30;
    static final int DEFAULT_FINAL_MINUTES = 60;

    private GoalRules() {}

    /**
     * Modèle de rythme. a1 et a2 : durées calibrées sur la V4 pour A1 et A2, gardées comme surcharges pour ne pas
     * changer leur comportement ; tout autre niveau suit la formule {@link #months(int, int)} sur la durée prévue de
     * sa version publiée ; other ne sert que si cette durée est inconnue.
     */
    record Template(String id, String name, String description, List<Day> days, Period a1, Period a2, Period other) {
        /** Minutes de travail par semaine du modèle : 150 en standard, 630 en intensif. */
        int weeklyMinutes() {
            return days.stream().mapToInt(day -> day.sessions() * day.minutes()).sum();
        }

        /** Durée conseillée pour un niveau : surcharge A1/A2, sinon formule sur la durée prévue (null : inconnue). */
        Period durationFor(String levelCode, Integer plannedMinutes) {
            if ("A1".equals(levelCode)) return a1;
            if ("A2".equals(levelCode)) return a2;
            if (plannedMinutes == null || plannedMinutes <= 0) return other;
            return Period.ofMonths(months(plannedMinutes, weeklyMinutes()));
        }
    }

    /** Modèles modifiables : Standard (cinq séances de 30 min) et Intensif (deux séances de 45 min chaque jour). */
    static final List<Template> TEMPLATES = List.of(
            new Template("standard", "Standard", "Une séance de 30 minutes du lundi au vendredi.",
                    // Durées calibrées sur la V4 (A1 ≈ 2 600 min, A2 ≈ 2 400 min avec révisions et évaluations) : à 150 min par
                    // semaine en séances de 30 min, le remplissage laisse ~10 % de marge, d'où cinq mois pour chaque niveau.
                    week(5, 1, 30), Period.ofMonths(5), Period.ofMonths(5), Period.ofMonths(5)),
            new Template("intensive", "Intensif", "Deux séances de 45 minutes chaque jour ; durée selon le niveau.",
                    week(7, 2, 45), Period.ofMonths(1), Period.ofMonths(2), Period.ofMonths(2)));

    /**
     * Mois conseillés pour un contenu de plannedMinutes à weeklyMinutes par semaine, 25 % de marge comprise :
     * max(1, ceil(plannedMinutes × 1,25 / weeklyMinutes / 4,345)), calculé exactement en entiers. B1 (≈ 3 540 min) :
     * sept mois en standard (150 min par semaine), deux en intensif (630).
     */
    static int months(int plannedMinutes, int weeklyMinutes) {
        if (plannedMinutes <= 0 || weeklyMinutes <= 0) return 1;
        long numerator = (long) plannedMinutes * MARGIN_PERCENT * 1000;
        long denominator = (long) weeklyMinutes * 100 * WEEKS_PER_MONTH_MILLI;
        return (int) Math.max(1, (numerator + denominator - 1) / denominator);
    }

    /**
     * Durées conseillées d'un modèle pour les niveaux publiés du catalogue (GET /v1/languages : langues puis niveaux,
     * dans l'ordre de leur position) : un élément par niveau publié de l'échelle ayant une durée prévue, sans doublon.
     */
    static List<GoalResource.TemplateDuration> durations(Template template, JsonNode languages) {
        List<GoalResource.TemplateDuration> durations = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        if (languages == null || !languages.isArray()) return List.of();
        for (JsonNode language : languages) {
            for (JsonNode level : language.path("levels")) {
                String code = level.path("code").asText("");
                JsonNode minutes = level.path("plannedMinutes");
                if (!level.path("published").asBoolean(false) || !Cefr.isLevel(code) || !minutes.canConvertToInt()
                        || minutes.asInt() < 0 || !seen.add(code)) {
                    continue;
                }
                durations.add(new GoalResource.TemplateDuration(code,
                        template.durationFor(code, minutes.asInt()).getMonths(), minutes.asInt()));
            }
        }
        return List.copyOf(durations);
    }

    /**
     * Durée prévue d'une version (structure servie par le catalogue, route interne des parcours), comme GET /languages :
     * activités, révision de chaque module non vide, bilan intermédiaire (s'il y a un module non vide) et examen blanc.
     * Null si la structure est illisible.
     */
    static Integer plannedMinutes(JsonNode track) {
        if (track == null || !track.path("modules").isArray()) return null;
        JsonNode planning = track.path("planning");
        int activities = 0;
        int filled = 0;
        for (JsonNode module : track.path("modules")) {
            int count = 0;
            for (JsonNode activity : module.path("activities")) {
                activities += Math.max(0, activity.path("estimatedMinutes").asInt(0));
                count++;
            }
            if (count > 0) filled++;
        }
        return activities + planning.path("reviewMinutes").asInt(DEFAULT_REVIEW_MINUTES) * filled
                + (filled > 0 ? planning.path("midtermMinutes").asInt(DEFAULT_MIDTERM_MINUTES) : 0)
                + planning.path("finalMinutes").asInt(DEFAULT_FINAL_MINUTES);
    }

    static Template template(String id) {
        return TEMPLATES.stream().filter(template -> template.id().equals(id)).findFirst()
                .orElseThrow(() -> HttpError.badRequest("Choisissez le modèle standard ou intensif."));
    }

    private static List<Day> week(int days, int sessions, int minutes) {
        List<Day> week = new ArrayList<>();
        for (int weekday = 1; weekday <= days; weekday++) week.add(new Day(weekday, sessions, minutes));
        return List.copyOf(week);
    }

    /**
     * Date cible par défaut : la durée du modèle pour le niveau visé, à partir du début, dans la limite d'un objectif
     * (treize mois). plannedMinutes : durée prévue de la version attribuée (null : inconnue, durée générique du modèle).
     */
    static LocalDate defaultTarget(String templateId, String levelCode, Integer plannedMinutes, LocalDate start) {
        LocalDate target = start.plus(template(templateId).durationFor(levelCode, plannedMinutes));
        LocalDate latest = start.plusDays(Planner.MAX_DAYS);
        return target.isAfter(latest) ? latest : target;
    }

    static void checkDates(LocalDate start, LocalDate target, LocalDate today) {
        if (start.isBefore(today) || start.isAfter(today.plusYears(1))) {
            throw HttpError.badRequest("Le début doit être compris entre aujourd’hui et dans un an.");
        }
        if (!target.isAfter(start) || target.isAfter(start.plusDays(Planner.MAX_DAYS))) {
            throw HttpError.badRequest("La date cible doit suivre le début, dans un délai de treize mois.");
        }
    }

    static String checkStartLevel(String startLevel) {
        if (!Cefr.isStartLevel(startLevel)) {
            throw HttpError.badRequest("Indiquez le niveau de départ : A0 pour un débutant, ou A1 à C1.");
        }
        return startLevel;
    }

    /** Disponibilités : un à sept jours distincts, une à six séances de 10 à 240 minutes, 12 heures par jour au plus. */
    static List<Day> checkAvailability(List<Day> days) {
        if (days == null || days.isEmpty() || days.size() > 7) {
            throw HttpError.badRequest("Choisissez au moins un jour de travail.");
        }
        Set<Integer> seen = new HashSet<>();
        for (Day day : days) {
            if (day == null || day.weekday() < 1 || day.weekday() > 7 || !seen.add(day.weekday())) {
                throw HttpError.badRequest("Chaque jour de la semaine apparaît une fois, numéroté de 1 (lundi) à 7.");
            }
            if (day.sessions() < 1 || day.sessions() > 6 || day.minutes() < 10 || day.minutes() > 240
                    || day.sessions() * day.minutes() > 720) {
                throw HttpError.badRequest("Prévoyez une à six séances de 10 à 240 minutes, 12 heures par jour au plus.");
            }
        }
        return days.stream().sorted(java.util.Comparator.comparingInt(Day::weekday)).toList();
    }

    /**
     * Qui valide un planning : le professeur référent ou l'administration pour un élève accompagné,
     * l'élève lui-même ou l'administration pour un élève autonome.
     */
    static boolean canValidate(boolean callerIsLearner, String callerRole, boolean accompanied) {
        if ("admin".equals(callerRole)) return true;
        return accompanied ? "teacher".equals(callerRole) : callerIsLearner;
    }

    /** Écart minimal entre deux événements d'état d'un même objectif : la précision de timestamptz. */
    static final Duration EVENT_TICK = Duration.ofNanos(1_000);

    /**
     * Heure d'un événement d'état de l'objectif (goal_set, plan_validated, goal_paused, goal_status_changed) : Suivi
     * garde l'état porté par l'événement le plus récent selon cette heure. C'est l'horloge du serveur, lue après
     * l'action, sans jamais revenir avant ni égaler l'heure du précédent événement de ce même objectif : une horloge
     * recalée en arrière ou deux transactions qui se chevauchent ne peuvent plus faire passer une pause avant la
     * validation qui la précède (EVO-042). {@code previous} : heure du précédent événement, ou null.
     */
    static OffsetDateTime eventTime(OffsetDateTime previous, OffsetDateTime clock) {
        if (previous == null) return clock;
        OffsetDateTime floor = previous.plus(EVENT_TICK);
        return clock.isBefore(floor) ? floor : clock;
    }
}
