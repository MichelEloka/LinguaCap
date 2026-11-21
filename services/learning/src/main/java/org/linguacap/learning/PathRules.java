package org.linguacap.learning;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.linguacap.common.HttpError;
import org.linguacap.learning.Planner.Day;

/**
 * Règles du parcours multi-niveaux, sans accès à la base : niveaux du cadre européen, cibles autorisées, difficulté
 * d'un objectif, disponibilités proposées, faisabilité d'un planning et droits calculés renvoyés au front.
 */
final class PathRules {
    /** Niveaux du cadre européen, dans l'ordre : A1 a le rang 1, C2 le rang 6 (A0 = 0, débutant). */
    static final List<String> LEVELS = List.of("A1", "A2", "B1", "B2", "C1", "C2");
    /** Horizon d'un parcours : trois ans au plus entre le début et la date cible. */
    static final int MAX_PATH_DAYS = 1095;
    static final Set<String> SUBMITTED_FINAL = Set.of("awaiting_grading", "validated", "to_consolidate");

    private PathRules() {}

    /** Barème de charge : minutes de travail par semaine au plus pour chaque niveau de difficulté. */
    record Band(String code, String label, Integer maxWeeklyMinutes) {}

    static final List<Band> BANDS = List.of(
            new Band("light", "Léger", 150),
            new Band("moderate", "Modéré", 300),
            new Band("sustained", "Soutenu", 450),
            new Band("intensive", "Intensif", 630),
            new Band("very_intensive", "Très intensif", 840),
            new Band("unrealistic", "Irréaliste", null));

    record Difficulty(String code, String label, int requiredWeeklyMinutes) {}

    /** Bande de difficulté avec la première date cible qui la respecte, à partir d'une date de début. */
    record BandView(String code, String label, Integer maxWeeklyMinutes, Integer minWeeks, String earliestTargetDate) {}

    record Feasibility(String code, int loadPercent) {}

    record Permissions(boolean canEditAvailability, boolean canValidate, boolean canChangeObjective,
                       boolean canProposeContract, boolean canDecideContract, boolean canPause, boolean canAddCourses,
                       boolean canAdvance) {}

    /** Rang d'un niveau : A0 = 0, A1 = 1 … C2 = 6, -1 si inconnu. */
    static int rank(String level) {
        if ("A0".equals(level)) return 0;
        int index = level == null ? -1 : LEVELS.indexOf(level);
        return index < 0 ? -1 : index + 1;
    }

    static String levelOfRank(int rank) {
        return rank >= 1 && rank <= LEVELS.size() ? LEVELS.get(rank - 1) : null;
    }

    static String checkStartLevel(String level) {
        if (level == null || rank(level) < 0 || "C2".equals(level)) {
            throw HttpError.badRequest("Indiquez le niveau de départ : A0 pour un débutant, ou A1 à C1.");
        }
        return level;
    }

    static String checkTargetLevel(String level) {
        if (level == null || rank(level) < 1) throw HttpError.badRequest("Choisissez le niveau visé, de A1 à C2.");
        return level;
    }

    /** Niveaux couverts par le parcours : rang strictement au-dessus du départ, jusqu'au niveau visé inclus. */
    static List<String> levelsBetween(String startLevel, String targetLevel) {
        List<String> levels = new ArrayList<>();
        for (int rank = rank(startLevel) + 1; rank <= rank(targetLevel); rank++) levels.add(levelOfRank(rank));
        return levels;
    }

    /** Cibles autorisées : niveaux publiés consécutifs au-dessus du niveau de départ. */
    static List<String> allowedTargets(String startLevel, Set<String> publishedLevels) {
        List<String> allowed = new ArrayList<>();
        for (int rank = Math.max(1, rank(startLevel) + 1); rank <= LEVELS.size(); rank++) {
            String level = levelOfRank(rank);
            if (!publishedLevels.contains(level)) break;
            allowed.add(level);
        }
        return allowed;
    }

    /** L'élève peut partir plus bas que son résultat au test, jamais plus haut. */
    static void checkStartNotAbovePlacement(String startLevel, String placedLevel) {
        if (placedLevel != null && rank(startLevel) > rank(placedLevel)) {
            throw HttpError.conflict("Le niveau de départ ne peut pas dépasser le résultat de votre test de niveau.");
        }
    }

    /** Charge hebdomadaire nécessaire : minutes restantes réparties sur les semaines disponibles, arrondies au-dessus. */
    static int requiredWeeklyMinutes(int requiredMinutes, LocalDate start, LocalDate target) {
        long days = ChronoUnit.DAYS.between(start, target);
        if (days <= 0) return requiredMinutes;
        return (int) Math.ceil(requiredMinutes * 7.0 / days);
    }

    /** Difficulté de l'objectif selon le barème ; moins d'une semaine est toujours irréaliste. */
    static Difficulty difficulty(int requiredMinutes, LocalDate start, LocalDate target) {
        int weekly = requiredWeeklyMinutes(requiredMinutes, start, target);
        if (ChronoUnit.DAYS.between(start, target) < 7) return of("unrealistic", weekly);
        for (Band band : BANDS) {
            if (band.maxWeeklyMinutes() != null && weekly <= band.maxWeeklyMinutes()) return of(band.code(), weekly);
        }
        return of("unrealistic", weekly);
    }

    static Difficulty of(String code, int requiredWeeklyMinutes) {
        String label = BANDS.stream().filter(band -> band.code().equals(code)).map(Band::label).findFirst().orElse(code);
        return new Difficulty(code, label, requiredWeeklyMinutes);
    }

    /** Bandes avec, pour chacune, la date cible la plus proche qui la respecte (au moins une semaine après le début). */
    static List<BandView> bands(int requiredMinutes, LocalDate start) {
        List<BandView> bands = new ArrayList<>();
        for (Band band : BANDS) {
            if (band.maxWeeklyMinutes() == null) {
                bands.add(new BandView(band.code(), band.label(), null, null, null));
                continue;
            }
            int max = band.maxWeeklyMinutes();
            long days = Math.max(7, (long) Math.ceil(requiredMinutes * 7.0 / max));
            int weeks = (int) Math.max(1, Math.ceil(requiredMinutes / (double) max));
            bands.add(new BandView(band.code(), band.label(), max, weeks, start.plusDays(days).toString()));
        }
        return bands;
    }

    static void checkObjective(String difficultyCode) {
        if ("unrealistic".equals(difficultyCode)) {
            throw HttpError.conflict("Cet objectif est irréaliste dans ce délai : repoussez la date cible ou visez un niveau plus proche.");
        }
    }

    /** Dates d'un objectif : début entre aujourd'hui et un an, date cible après le début, dans l'horizon d'un parcours. */
    static void checkDates(LocalDate start, LocalDate target, LocalDate today) {
        if (start.isBefore(today) || start.isAfter(today.plusYears(1))) {
            throw HttpError.badRequest("Le début doit être compris entre aujourd’hui et dans un an.");
        }
        checkTarget(start, target);
    }

    static void checkTarget(LocalDate start, LocalDate target) {
        if (!target.isAfter(start) || target.isAfter(start.plusDays(MAX_PATH_DAYS))) {
            throw HttpError.badRequest("La date cible doit suivre le début, dans un délai de trois ans.");
        }
    }

    /** Capacité hebdomadaire d'un ensemble de jours, en minutes. */
    static int weeklyCapacity(List<Day> days) {
        return days == null ? 0 : days.stream().mapToInt(day -> day.sessions() * day.minutes()).sum();
    }

    /**
     * Disponibilités proposées pour une charge hebdomadaire : du lundi au vendredi, la charge majorée de 15 %
     * arrondie à 5 minutes (15 au moins) ; au-delà de 60 minutes par jour, deux séances ; au-delà de 240, sept jours.
     */
    static List<Day> suggestedAvailability(int weeklyMinutes) {
        int days = 5;
        int daily = roundUp5(Math.max(15, (int) Math.ceil(weeklyMinutes * 1.15 / days)));
        if (daily > 240) {
            days = 7;
            daily = roundUp5(Math.max(15, (int) Math.ceil(weeklyMinutes * 1.15 / days)));
        }
        int sessions = daily > 60 ? Math.max(2, (int) Math.ceil(daily / 240.0)) : 1;
        int minutes = Math.min(240, Math.max(10, roundUp5((int) Math.ceil(daily / (double) sessions))));
        while (sessions > 1 && sessions * minutes > 720) sessions--;
        sessions = Math.min(6, sessions);
        List<Day> week = new ArrayList<>();
        for (int weekday = 1; weekday <= days; weekday++) week.add(new Day(weekday, sessions, minutes));
        return List.copyOf(week);
    }

    private static int roundUp5(int minutes) {
        return (minutes + 4) / 5 * 5;
    }

    /** Faisabilité d'un planning : confortable jusqu'à 85 % de la capacité, serré jusqu'à 100 %, insuffisant au-delà. */
    static Feasibility feasibility(int requiredMinutes, int capacityMinutes) {
        int load;
        if (capacityMinutes <= 0) load = requiredMinutes == 0 ? 0 : 999;
        else load = (int) Math.min(999, Math.round(requiredMinutes * 100.0 / capacityMinutes));
        String code = load <= 85 ? "comfortable" : load <= 100 ? "tight" : "insufficient";
        return new Feasibility(code, load);
    }

    /** Engagement du contrat : la capacité des jours couvre au moins l'engagement hebdomadaire minimal. */
    static boolean respectsCommitment(List<Day> days, int weeklyMinutes) {
        return weeklyCapacity(days) >= weeklyMinutes;
    }

    /** Engagement hebdomadaire inscrit au contrat : la charge nécessaire, sans dépasser la capacité des jours choisis. */
    static int commitment(int requiredWeeklyMinutes, List<Day> days) {
        return Math.max(0, Math.min(5040, Math.min(requiredWeeklyMinutes, weeklyCapacity(days))));
    }

    /** Suite donnée à un événement d'examen pour le parcours. */
    enum ExamFollowUp { NONE, ACTIVATE_NEXT, COMPLETE_PATH }

    /**
     * La remise de l'examen blanc d'un niveau actif ouvre le niveau suivant s'il est prévu ; sa validation sur le
     * dernier niveau termine le parcours. Un niveau déjà terminé (reprise d'un examen « à consolider ») ne déclenche
     * jamais rien : rejouer l'événement ne change rien de plus.
     */
    static ExamFollowUp examFollowUp(String stepStatus, boolean hasNextStep, String kind, String event, String decision) {
        if (!"active".equals(stepStatus) || !"final".equals(kind)) return ExamFollowUp.NONE;
        if ("submitted".equals(event) && hasNextStep) return ExamFollowUp.ACTIVATE_NEXT;
        if ("graded".equals(event) && !hasNextStep && "validated".equals(decision)) return ExamFollowUp.COMPLETE_PATH;
        return ExamFollowUp.NONE;
    }

    /** Appelant d'une action sur un parcours : l'élève lui-même, son professeur référent ou l'administration. */
    record Caller(boolean learner, boolean teacher, boolean admin, boolean accompanied) {
        boolean educator() {
            return teacher || admin;
        }
    }

    /** État du parcours utile au calcul des droits. */
    record PathState(String status, boolean paused, boolean hasNextStep, String activeGoalStatus, String pendingContract,
                     boolean engaged) {}

    /**
     * État d'une proposition de planning, comparée au planning en vigueur et au contrat accepté. prerequisiteMet :
     * prérequis du niveau actif validé ou confirmé (une attribution d'A2 sans A1 validé attend le diagnostic).
     */
    record ProposalState(String status, int baseRevision, int validatedRevision, int overflowCount,
                         LocalDate targetDate, List<Day> availability, boolean prerequisiteMet) {
        /** Proposition dont le niveau actif n'a pas de prérequis en attente. */
        ProposalState(String status, int baseRevision, int validatedRevision, int overflowCount, LocalDate targetDate,
                      List<Day> availability) {
            this(status, baseRevision, validatedRevision, overflowCount, targetDate, availability, true);
        }
    }

    /** Conditions verrouillées par le contrat accepté (null tant que le parcours n'est pas engagé). */
    record Engagement(String targetLevel, LocalDate targetDate, int weeklyMinutes) {}

    /** Qui valide une proposition : l'élève pour démarrer son brouillon ; ensuite l'élève, le professeur ou l'administration. */
    static boolean mayValidate(Caller caller, String pathStatus) {
        if ("draft".equals(pathStatus)) return caller.learner();
        return "active".equals(pathStatus) && (caller.learner() || caller.educator());
    }

    /**
     * Raison qui empêche de valider une proposition, ou null si elle peut l'être par cet appelant. Un prérequis non
     * confirmé bloque la validation pour tous (not_allowed) tant que le diagnostic ou le professeur ne l'a pas
     * confirmé. Une fois le contrat engagé, l'objectif verrouillé puis l'engagement passent avant le débordement :
     * des jours sous l'engagement débordent presque toujours, et c'est l'engagement qu'il faut d'abord rétablir.
     */
    static String blockingReason(Caller caller, String pathStatus, String pathTargetLevel, ProposalState proposal,
                                 Engagement engagement) {
        if (proposal == null || !"proposed".equals(proposal.status())) return null;
        if (proposal.baseRevision() != proposal.validatedRevision()) return "stale";
        if (!proposal.prerequisiteMet()) return "not_allowed";
        if (engagement != null) {
            if (!Objects.equals(engagement.targetDate(), proposal.targetDate())
                    || !Objects.equals(engagement.targetLevel(), pathTargetLevel)) {
                return "objective_locked";
            }
            if (!respectsCommitment(proposal.availability(), engagement.weeklyMinutes())) return "commitment";
        }
        if (proposal.overflowCount() > 0) return "overflow";
        if (!mayValidate(caller, pathStatus)) return "not_allowed";
        return null;
    }

    /** Droits calculés (section 3.6 du plan), renvoyés au front avec la vue du parcours. */
    static Permissions permissions(Caller caller, PathState path, String proposalBlockingReason, boolean proposalPending) {
        boolean draft = "draft".equals(path.status());
        boolean active = "active".equals(path.status());
        boolean editAvailability = caller.learner() && (draft || active) || caller.educator() && active;
        boolean validate = proposalPending && proposalBlockingReason == null;
        boolean changeObjective = draft && caller.learner();
        boolean proposeContract = active && (caller.learner() || caller.educator());
        boolean decide = path.pendingContract() != null && active
                && ("pending_teacher".equals(path.pendingContract()) ? caller.educator() && !caller.learner()
                : "pending_learner".equals(path.pendingContract()) && caller.learner());
        boolean pause = active && !path.paused() && (caller.learner() && !caller.accompanied() || caller.educator());
        boolean addCourses = active && caller.educator();
        boolean finalSubmitted = path.activeGoalStatus() != null && SUBMITTED_FINAL.contains(path.activeGoalStatus());
        boolean advance = active && path.hasNextStep()
                && (caller.educator() || caller.learner() && finalSubmitted);
        return new Permissions(editAvailability, validate, changeObjective, proposeContract, decide, pause, addCourses,
                advance);
    }
}
