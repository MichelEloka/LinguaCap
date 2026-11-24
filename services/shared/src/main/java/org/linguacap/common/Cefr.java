package org.linguacap.common;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Échelle du Cadre européen commun de référence (CECRL), constante de domaine unique des services : ordre, rang et
 * libellé générique des niveaux. Elle sert à valider un code et à trier, jamais à décider qu'un niveau est ouvert :
 * la disponibilité d'un niveau, son titre, son ordre et son prérequis se lisent dans le catalogue.
 */
public final class Cefr {
    /** Point de départ d'un débutant (déclaré ou placé par le test de niveau) : rang 0, hors de l'échelle des niveaux. */
    public static final String BEGINNER = "A0";
    /** Niveaux de l'échelle, dans l'ordre de progression : A1 a le rang 1, C2 le rang 6. */
    public static final List<String> LEVELS = List.of("A1", "A2", "B1", "B2", "C1", "C2");
    /** Ordre de l'échelle (A0 avant A1 … C2) ; un code inconnu passe en tête (rang -1). */
    public static final Comparator<String> ORDER = Comparator.comparingInt(Cefr::rank);

    private static final Map<String, String> LABELS = Map.of(BEGINNER, "Débutant", "A1", "A1 · Découverte",
            "A2", "A2 · Survie", "B1", "B1 · Seuil", "B2", "B2 · Avancé", "C1", "C1 · Autonome", "C2", "C2 · Maîtrise");

    private Cefr() {}

    /** Code de niveau de l'échelle (A1 à C2) ; A0 n'en est pas un. */
    public static boolean isLevel(String code) {
        return code != null && LEVELS.contains(code);
    }

    /** Niveau de départ possible : A0 (débutant) à C1 ; C2 n'a pas de niveau au-dessus. */
    public static boolean isStartLevel(String code) {
        return BEGINNER.equals(code) || isLevel(code) && rank(code) < LEVELS.size();
    }

    /** Rang d'un niveau : A0 = 0, A1 = 1 … C2 = 6, -1 si le code est inconnu. */
    public static int rank(String code) {
        if (BEGINNER.equals(code)) return 0;
        int index = code == null ? -1 : LEVELS.indexOf(code);
        return index < 0 ? -1 : index + 1;
    }

    /** Niveau d'un rang de 1 à 6, ou null (le rang 0, A0, n'est pas un niveau). */
    public static String levelOfRank(int rank) {
        return rank >= 1 && rank <= LEVELS.size() ? LEVELS.get(rank - 1) : null;
    }

    /** Niveau suivant sur l'échelle (A0 → A1, B1 → B2), ou null après C2 ou pour un code inconnu. */
    public static String next(String code) {
        int rank = rank(code);
        return rank < 0 ? null : levelOfRank(rank + 1);
    }

    /** Libellé générique (« B1 · Seuil », « Débutant ») ; le code lui-même s'il est inconnu. */
    public static String label(String code) {
        return code == null ? null : LABELS.getOrDefault(code, code);
    }
}
