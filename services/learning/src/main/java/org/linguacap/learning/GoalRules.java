package org.linguacap.learning;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.linguacap.common.HttpError;
import org.linguacap.learning.Planner.Day;

/** Règles de l'objectif et des disponibilités, sans accès à la base : testées unitairement (DEV-034, DEV-038, DEV-039). */
final class GoalRules {
    static final Set<String> START_LEVELS = Set.of("A0", "A1", "A2", "B1", "B2", "C1");

    private GoalRules() {}

    record Template(String id, String name, String description, List<Day> days, Period a1, Period a2, Period other) {
        Period durationFor(String levelCode) {
            return switch (levelCode) {
                case "A1" -> a1;
                case "A2" -> a2;
                default -> other;
            };
        }
    }

    /** Modèles modifiables : Standard (cinq séances de 30 min) et Intensif (deux séances de 45 min chaque jour). */
    static final List<Template> TEMPLATES = List.of(
            new Template("standard", "Standard", "Une séance de 30 minutes du lundi au vendredi.",
                    week(5, 1, 30), Period.ofMonths(3), Period.ofMonths(4), Period.ofMonths(4)),
            new Template("intensive", "Intensif", "Deux séances de 45 minutes chaque jour : A1 en un mois, A2 en deux mois.",
                    week(7, 2, 45), Period.ofMonths(1), Period.ofMonths(2), Period.ofMonths(2)));

    static Template template(String id) {
        return TEMPLATES.stream().filter(template -> template.id().equals(id)).findFirst()
                .orElseThrow(() -> HttpError.badRequest("Choisissez le modèle standard ou intensif."));
    }

    private static List<Day> week(int days, int sessions, int minutes) {
        List<Day> week = new ArrayList<>();
        for (int weekday = 1; weekday <= days; weekday++) week.add(new Day(weekday, sessions, minutes));
        return List.copyOf(week);
    }

    /** Date cible par défaut : la durée du modèle pour le niveau visé, à partir du début. */
    static LocalDate defaultTarget(String templateId, String levelCode, LocalDate start) {
        return start.plus(template(templateId).durationFor(levelCode));
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
        if (startLevel == null || !START_LEVELS.contains(startLevel)) {
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
}
