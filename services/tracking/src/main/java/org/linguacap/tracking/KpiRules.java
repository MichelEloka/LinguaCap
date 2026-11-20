package org.linguacap.tracking;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Indicateurs du tableau de bord administrateur (DEV-085 à DEV-090), calculés à partir des projections de Suivi.
 * Chaque taux donne son numérateur et son dénominateur ; un groupe vide renvoie un taux nul plutôt qu'une division.
 */
final class KpiRules {
    static final ZoneId PARIS = ZoneId.of("Europe/Paris");
    static final Duration WINDOW = Duration.ofDays(7);

    private KpiRules() {}

    public record Invitation(String id, OffsetDateTime sentAt, String learnerId) {}

    public record Goal(String enrollmentId, String learnerId, String startLevel, String levelCode, String template,
                Boolean accompanied, LocalDate initialTargetDate) {}

    /** Séance projetée ; supersededAt : replanification qui l'a remplacée. */
    public record Session(String enrollmentId, String learnerId, OffsetDateTime dueAt, OffsetDateTime completedAt,
                   OffsetDateTime supersededAt) {}

    public record Activity(String learnerId, OffsetDateTime at) {}

    public record Attempt(String enrollmentId, String kind, String status, OffsetDateTime submittedAt, String decision,
                   Map<String, Integer> scores) {}

    public record Relance(String learnerId, OffsetDateTime sentAt, OffsetDateTime resumedAt) {}

    public record Filters(LocalDate from, LocalDate to, String startLevel, String levelCode, String template, String kind) {
        boolean goalFilter() {
            return startLevel != null || levelCode != null || template != null || kind != null;
        }

        boolean accepts(Goal goal) {
            return (startLevel == null || startLevel.equals(goal.startLevel()))
                    && (levelCode == null || levelCode.equals(goal.levelCode()))
                    && (template == null || template.equals(goal.template()))
                    && (kind == null || "accompanied".equals(kind) == Boolean.TRUE.equals(goal.accompanied()));
        }

        boolean inPeriod(OffsetDateTime instant) {
            if (instant == null) return false;
            LocalDate day = instant.atZoneSameInstant(PARIS).toLocalDate();
            return !day.isBefore(from) && !day.isAfter(to);
        }

        boolean inPeriod(LocalDate day) {
            return day != null && !day.isBefore(from) && !day.isAfter(to);
        }
    }

    public record Rate(int numerator, int denominator, Double rate) {
        static Rate of(int numerator, int denominator) {
            return new Rate(numerator, denominator, denominator == 0 ? null : Math.round(1000.0 * numerator / denominator) / 10.0);
        }
    }

    public record Week(LocalDate weekStart, int learners) {}

    public record Progression(String competence, int learners, Double midterm, Double fin, Double delta) {}

    public record Dashboard(Rate activation, List<Week> activeLearners, int activeLearnersTotal, Rate sessionsOnTime,
                     Rate goalsValidated, int goalsAwaitingGrading, List<Progression> progression, Rate resumption,
                     int goals) {}

    static Dashboard compute(Filters filters, OffsetDateTime now, List<Invitation> invitations, List<Goal> goals,
                             List<Session> sessions, List<Activity> activity, List<Attempt> attempts, List<Relance> relances) {
        Map<String, Goal> byEnrollment = goals.stream().collect(Collectors.toMap(Goal::enrollmentId, goal -> goal, (a, b) -> a));
        Map<String, List<Goal>> byLearner = goals.stream().collect(Collectors.groupingBy(Goal::learnerId));
        Predicate<String> learnerSelected = learnerId -> !filters.goalFilter()
                || byLearner.getOrDefault(learnerId, List.of()).stream().anyMatch(filters::accepts);
        List<Goal> selectedGoals = goals.stream().filter(filters::accepts).toList();
        Set<String> selectedEnrollments = selectedGoals.stream().map(Goal::enrollmentId).collect(Collectors.toSet());

        return new Dashboard(activation(filters, now, invitations, sessions, learnerSelected),
                activeWeeks(filters, activity, learnerSelected),
                (int) activity.stream().filter(item -> filters.inPeriod(item.at()) && learnerSelected.test(item.learnerId()))
                        .map(Activity::learnerId).distinct().count(),
                sessionsOnTime(filters, now, sessions, selectedEnrollments),
                goalsValidated(filters, selectedGoals, attempts), awaitingGrading(filters, selectedGoals, attempts),
                progression(attempts, selectedEnrollments, byEnrollment),
                resumption(filters, now, relances, learnerSelected), selectedGoals.size());
    }

    /**
     * Activation à sept jours (DEV-085) : invitations dont la fenêtre de sept jours est écoulée, envoyées dans la
     * période ; une réémission garde la date de l'invitation d'origine. Réussite : première séance terminée dans la fenêtre.
     */
    static Rate activation(Filters filters, OffsetDateTime now, List<Invitation> invitations, List<Session> sessions,
                           Predicate<String> learnerSelected) {
        Map<String, OffsetDateTime> origin = new HashMap<>();
        Map<String, String> learners = new HashMap<>();
        for (Invitation invitation : invitations) {
            origin.merge(invitation.id(), invitation.sentAt(), (a, b) -> a.isBefore(b) ? a : b);
            if (invitation.learnerId() != null) learners.put(invitation.id(), invitation.learnerId());
        }
        Map<String, OffsetDateTime> firstSession = new HashMap<>();
        for (Session session : sessions) {
            if (session.completedAt() != null) {
                firstSession.merge(session.learnerId(), session.completedAt(), (a, b) -> a.isBefore(b) ? a : b);
            }
        }
        int denominator = 0;
        int numerator = 0;
        for (Map.Entry<String, OffsetDateTime> entry : origin.entrySet()) {
            OffsetDateTime sent = entry.getValue();
            String learnerId = learners.get(entry.getKey());
            if (!filters.inPeriod(sent) || sent.plus(WINDOW).isAfter(now)) continue;
            if (filters.goalFilter() && (learnerId == null || !learnerSelected.test(learnerId))) continue;
            denominator++;
            OffsetDateTime first = learnerId == null ? null : firstSession.get(learnerId);
            if (first != null && !first.isAfter(sent.plus(WINDOW))) numerator++;
        }
        return Rate.of(numerator, denominator);
    }

    /** Élèves actifs par semaine (DEV-086) : élèves distincts ayant une activité pédagogique, semaine par semaine. */
    static List<Week> activeWeeks(Filters filters, List<Activity> activity, Predicate<String> learnerSelected) {
        Map<LocalDate, Set<String>> weeks = new TreeMap<>();
        LocalDate week = filters.from().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        while (!week.isAfter(filters.to())) {
            weeks.put(week, new HashSet<>());
            week = week.plusWeeks(1);
        }
        for (Activity item : activity) {
            if (!filters.inPeriod(item.at()) || !learnerSelected.test(item.learnerId())) continue;
            LocalDate start = item.at().atZoneSameInstant(PARIS).toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            weeks.computeIfAbsent(start, key -> new HashSet<>()).add(item.learnerId());
        }
        List<Week> result = new ArrayList<>();
        weeks.forEach((start, learners) -> result.add(new Week(start, learners.size())));
        return result;
    }

    /**
     * Séances terminées à temps (DEV-087) : séances échues dans la période. Une séance replanifiée avant son
     * échéance est remplacée par la nouvelle date ; une séance replanifiée après son échéance reste un retard constaté.
     */
    static Rate sessionsOnTime(Filters filters, OffsetDateTime now, List<Session> sessions, Set<String> enrollments) {
        int due = 0;
        int onTime = 0;
        for (Session session : sessions) {
            if (!enrollments.contains(session.enrollmentId()) || !filters.inPeriod(session.dueAt())) continue;
            if (session.supersededAt() != null) {
                if (session.dueAt().isBefore(session.supersededAt()) && session.completedAt() == null) due++;
                continue;
            }
            if (session.dueAt().isAfter(now)) continue;
            due++;
            if (session.completedAt() != null && !session.completedAt().isAfter(session.dueAt())) onTime++;
        }
        return Rate.of(onTime, due);
    }

    /**
     * Objectifs validés à l'échéance (DEV-088) : parcours dont la date cible initiale tombe dans la période, validés
     * par une tentative d'examen blanc réussie remise au plus tard ce jour-là, même corrigée après.
     */
    static Rate goalsValidated(Filters filters, List<Goal> goals, List<Attempt> attempts) {
        int total = 0;
        int validated = 0;
        for (Goal goal : goals) {
            if (!filters.inPeriod(goal.initialTargetDate())) continue;
            total++;
            OffsetDateTime deadline = goal.initialTargetDate().plusDays(1).atStartOfDay(PARIS).toOffsetDateTime();
            boolean success = attempts.stream().anyMatch(attempt -> goal.enrollmentId().equals(attempt.enrollmentId())
                    && "final".equals(attempt.kind()) && "validated".equals(attempt.decision())
                    && attempt.submittedAt() != null && attempt.submittedAt().isBefore(deadline));
            if (success) validated++;
        }
        return Rate.of(validated, total);
    }

    /** Tentatives d'examen blanc remises à temps et encore en attente de correction, indiquées à part. */
    static int awaitingGrading(Filters filters, List<Goal> goals, List<Attempt> attempts) {
        int waiting = 0;
        for (Goal goal : goals) {
            if (!filters.inPeriod(goal.initialTargetDate())) continue;
            OffsetDateTime deadline = goal.initialTargetDate().plusDays(1).atStartOfDay(PARIS).toOffsetDateTime();
            boolean pending = attempts.stream().anyMatch(attempt -> goal.enrollmentId().equals(attempt.enrollmentId())
                    && "final".equals(attempt.kind()) && "submitted".equals(attempt.status())
                    && attempt.submittedAt() != null && attempt.submittedAt().isBefore(deadline));
            if (pending) waiting++;
        }
        return waiting;
    }

    /**
     * Progression entre les bilans (DEV-089) : pour les parcours ayant un bilan intermédiaire et un examen blanc
     * corrigés, écart moyen par compétence, en pourcentage de la grille du parcours.
     */
    static List<Progression> progression(List<Attempt> attempts, Set<String> enrollments, Map<String, Goal> goals) {
        Map<String, Attempt> midterms = latest(attempts, "midterm", enrollments);
        Map<String, Attempt> finals = latest(attempts, "final", enrollments);
        Map<String, double[]> sums = new LinkedHashMap<>();
        for (Map.Entry<String, Attempt> entry : midterms.entrySet()) {
            Attempt fin = finals.get(entry.getKey());
            if (fin == null) continue;
            for (Map.Entry<String, Integer> score : entry.getValue().scores().entrySet()) {
                Integer after = fin.scores().get(score.getKey());
                if (after == null) continue;
                double[] sum = sums.computeIfAbsent(score.getKey(), key -> new double[3]);
                sum[0] += score.getValue();
                sum[1] += after;
                sum[2]++;
            }
        }
        List<Progression> result = new ArrayList<>();
        sums.forEach((competence, sum) -> {
            double before = Math.round(10.0 * sum[0] / sum[2]) / 10.0;
            double after = Math.round(10.0 * sum[1] / sum[2]) / 10.0;
            result.add(new Progression(competence, (int) sum[2], before, after, Math.round(10.0 * (after - before)) / 10.0));
        });
        result.sort(Comparator.comparing(Progression::competence));
        return result;
    }

    /**
     * Reprise après encouragement (DEV-090) : relances pour un retard dont la fenêtre de sept jours est écoulée ;
     * réussite si l'élève a une activité pédagogique dans ces sept jours.
     */
    static Rate resumption(Filters filters, OffsetDateTime now, List<Relance> relances, Predicate<String> learnerSelected) {
        int total = 0;
        int resumed = 0;
        for (Relance relance : relances) {
            if (!filters.inPeriod(relance.sentAt()) || relance.sentAt().plus(WINDOW).isAfter(now)
                    || !learnerSelected.test(relance.learnerId())) continue;
            total++;
            if (relance.resumedAt() != null && !relance.resumedAt().isAfter(relance.sentAt().plus(WINDOW))) resumed++;
        }
        return Rate.of(resumed, total);
    }

    private static Map<String, Attempt> latest(List<Attempt> attempts, String kind, Set<String> enrollments) {
        Map<String, Attempt> latest = new HashMap<>();
        for (Attempt attempt : attempts) {
            if (!kind.equals(attempt.kind()) || !"graded".equals(attempt.status()) || !enrollments.contains(attempt.enrollmentId())
                    || attempt.scores() == null) continue;
            latest.merge(attempt.enrollmentId(), attempt, (a, b) -> Objects.requireNonNullElse(a.submittedAt(), now0())
                    .isAfter(Objects.requireNonNullElse(b.submittedAt(), now0())) ? a : b);
        }
        return latest;
    }

    private static OffsetDateTime now0() {
        return OffsetDateTime.MIN;
    }
}
