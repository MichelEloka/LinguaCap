package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.regex.Pattern;
import org.linguacap.common.HttpError;

/**
 * Règles d'une mission (EVO-044) : définition figée à l'ouverture (consigne, partie orale, partie écrite, liste
 * d'auto-vérification et, aux niveaux B, grille de critères), brouillon, conditions de remise, destinataire, retour du
 * professeur (noté critère par critère quand la mission a une grille) et reprise.
 * « On ne fait pas confiance » : ce que l'élève affirme avoir fait est remis (texte, enregistrement) ou coché.
 */
final class MissionRules {
    static final String DRAFT = "draft";
    static final String SUBMITTED = "submitted";
    static final String SENT = "sent";
    static final String REVIEWED = "reviewed";
    static final String VALIDATED = "validated";
    static final String TO_REDO = "to_redo";
    static final String TEACHER = "teacher";
    static final String REVIEWER = "reviewer";
    /** Bornes techniques communes (catalogue, Évaluations, base, interface) : 3 000 caractères, 300 s, 400 mots. */
    static final int MAX_TEXT = 3000;
    static final int MIN_SECONDS = 30;
    static final int MAX_SECONDS = 300;
    static final int DEFAULT_SECONDS = 120;
    static final int MIN_CHARS = 200;
    static final int DEFAULT_CHARS = 1500;
    static final int MAX_MIN_WORDS = 400;
    static final int MAX_COMMENT = 2000;
    static final int MAX_CHECKLIST = 6;
    static final int MAX_ITEM = 160;
    /** Grille : six critères au plus, de 1 à 20 points chacun, libellé de 200 caractères au plus. */
    static final int MAX_CRITERIA = 6;
    static final int MAX_CRITERION_POINTS = 20;
    static final int MAX_CRITERION_LABEL = 200;
    private static final Pattern CRITERION_ID = Pattern.compile("[a-z0-9]+(-[a-z0-9]+)*");

    private static final JsonNodeFactory JSON = JsonNodeFactory.instance;

    private MissionRules() {}

    /** Destinataire de la remise : statut submitted avec correcteur, ou sent sans destinataire. */
    record Recipient(String status, UUID reviewerId, String kind) {}

    /**
     * Notation sur grille d'un retour : points par critère (dans l'ordre de la grille), score et score maximal.
     * Sans grille, aucune notation (null).
     */
    record Grade(ObjectNode points, int score, int maxScore) {}

    /**
     * Définition figée à partir du contenu de l'activité servi par Catalogue (route interne des activités) :
     * {title, description, oral:{prompt,maxSeconds}|null, written:{prompt,maxChars,minWords}|null, checklist,
     * criteria:[{id,label,maxPoints}]} ; criteria vaut [] pour une mission sans grille (A1, A2).
     */
    static ObjectNode definition(JsonNode content) {
        JsonNode activity = content.path("activity");
        if (!"mission".equals(activity.path("kind").asText())) {
            throw HttpError.conflict("Cette activité n’est pas une mission.");
        }
        JsonNode mission = content.path("mission").isObject() ? content.path("mission") : activity.path("mission");
        if (!mission.isObject()) throw HttpError.unavailable("Cette mission est temporairement indisponible.");
        ObjectNode definition = JSON.objectNode();
        definition.put("title", activity.path("title").asText(""));
        definition.put("description", content.path("lesson").path("description").asText(""));
        JsonNode oral = mission.path("oral");
        if (oral.isObject()) {
            definition.putObject("oral").put("prompt", oral.path("prompt").asText(""))
                    .put("maxSeconds", bounded(oral.path("maxSeconds"), MIN_SECONDS, MAX_SECONDS, DEFAULT_SECONDS));
        } else {
            definition.putNull("oral");
        }
        JsonNode written = mission.path("written");
        if (written.isObject()) {
            definition.putObject("written").put("prompt", written.path("prompt").asText(""))
                    .put("maxChars", bounded(written.path("maxChars"), MIN_CHARS, MAX_TEXT, DEFAULT_CHARS))
                    .put("minWords", bounded(written.path("minWords"), 0, MAX_MIN_WORDS, 0));
        } else {
            definition.putNull("written");
        }
        if (!oral.isObject() && !written.isObject()) {
            throw HttpError.unavailable("Cette mission est temporairement indisponible.");
        }
        ArrayNode checklist = definition.putArray("checklist");
        for (JsonNode item : mission.path("checklist")) {
            String text = item.asText("").strip();
            if (!text.isEmpty() && checklist.size() < MAX_CHECKLIST) {
                checklist.add(text.length() > MAX_ITEM ? text.substring(0, MAX_ITEM) : text);
            }
        }
        // Grille du correcteur, recopiée du catalogue (qui l'a déjà contrôlée) : identifiants uniques, 6 critères au plus.
        ArrayNode criteria = definition.putArray("criteria");
        Set<String> ids = new HashSet<>();
        for (JsonNode criterion : mission.path("criteria")) {
            String id = criterion.path("id").asText("");
            if (!CRITERION_ID.matcher(id).matches() || !ids.add(id) || criteria.size() == MAX_CRITERIA) continue;
            String label = criterion.path("label").asText("").strip();
            criteria.addObject().put("id", id)
                    .put("label", label.length() > MAX_CRITERION_LABEL ? label.substring(0, MAX_CRITERION_LABEL) : label)
                    .put("maxPoints", bounded(criterion.path("maxPoints"), 1, MAX_CRITERION_POINTS, 1));
        }
        return definition;
    }

    /** Grille figée d'une remise ([] pour une mission sans grille ou figée avant les grilles). */
    static JsonNode criteria(JsonNode definition) {
        JsonNode criteria = definition == null ? null : definition.path("criteria");
        return criteria != null && criteria.isArray() ? criteria : JSON.arrayNode();
    }

    /**
     * Points du correcteur (400 sinon) : avec une grille, un entier de 0 à maxPoints pour chaque critère et aucune clé
     * inconnue ; sans grille, aucun point (points absent ou null). Renvoie la notation, ou null sans grille. La
     * décision reste celle du correcteur, quel que soit le score.
     */
    static Grade checkPoints(JsonNode definition, JsonNode points) {
        JsonNode criteria = criteria(definition);
        boolean given = points != null && !points.isNull() && !points.isMissingNode();
        if (criteria.isEmpty()) {
            if (given) throw HttpError.badRequest("Cette mission n’a pas de grille : envoyez le retour sans points.");
            return null;
        }
        if (!given || !points.isObject()) {
            throw HttpError.badRequest("Notez chaque critère de la grille avant d’envoyer le retour.");
        }
        Set<String> known = new HashSet<>();
        criteria.forEach(criterion -> known.add(criterion.path("id").asText()));
        points.fieldNames().forEachRemaining(name -> {
            if (!known.contains(name)) {
                throw HttpError.badRequest("Le critère « " + name + " » n’appartient pas à la grille de cette mission.");
            }
        });
        ObjectNode ordered = JSON.objectNode();
        int score = 0;
        int maxScore = 0;
        for (JsonNode criterion : criteria) {
            String id = criterion.path("id").asText();
            String label = criterion.path("label").asText(id);
            int maxPoints = criterion.path("maxPoints").asInt();
            JsonNode value = points.get(id);
            if (value == null || value.isNull()) throw HttpError.badRequest("Notez le critère « " + label + " ».");
            if (!value.isIntegralNumber() || !value.canConvertToInt() || value.asInt() < 0 || value.asInt() > maxPoints) {
                throw HttpError.badRequest("Le critère « " + label + " » se note par un nombre entier de 0 à "
                        + maxPoints + ".");
            }
            ordered.put(id, value.asInt());
            score += value.asInt();
            maxScore += maxPoints;
        }
        return new Grade(ordered, score, maxScore);
    }

    /** Longueur comptée comme la base (caractères Unicode). */
    static int length(String text) {
        return text == null ? 0 : text.codePointCount(0, text.length());
    }

    /** Mots du texte : suites contenant au moins une lettre ou un chiffre. */
    static int words(String text) {
        if (text == null || text.isBlank()) return 0;
        int count = 0;
        for (String word : text.strip().split("\\s+")) {
            if (word.codePoints().anyMatch(Character::isLetterOrDigit)) count++;
        }
        return count;
    }

    /** Texte du brouillon : 3 000 caractères au plus (et la limite de la mission), seulement s'il y a un écrit (400). */
    static String checkText(JsonNode definition, String text) {
        if (text == null) return null;
        if (length(text) > MAX_TEXT) {
            throw HttpError.badRequest("Le texte de la mission compte 3 000 caractères au plus.");
        }
        JsonNode written = definition.path("written");
        if (!written.isObject()) {
            if (!text.isBlank()) throw HttpError.badRequest("Cette mission n’attend pas de texte écrit.");
            return "";
        }
        int maxChars = written.path("maxChars").asInt(MAX_TEXT);
        if (length(text) > maxChars) {
            throw HttpError.badRequest("Le texte de cette mission compte " + maxChars + " caractères au plus.");
        }
        return text;
    }

    /** Points cochés : indices de la liste, sans doublon, renvoyés triés (400 sinon). */
    static List<Integer> checkChecklist(JsonNode definition, List<Integer> checked) {
        if (checked == null) return null;
        int size = definition.path("checklist").size();
        if (checked.size() > size) throw HttpError.badRequest("Un point coché n’appartient pas à la liste de vérification.");
        TreeSet<Integer> sorted = new TreeSet<>();
        for (Integer index : checked) {
            if (index == null || index < 0 || index >= size || !sorted.add(index)) {
                throw HttpError.badRequest("Un point coché n’appartient pas à la liste de vérification.");
            }
        }
        return new ArrayList<>(sorted);
    }

    /**
     * Ce qui manque avant la remise (409), ou null : toute la liste cochée, le texte si un écrit est prévu (avec son
     * nombre de mots minimal), l'enregistrement si un oral est prévu.
     */
    static String submitRefusal(JsonNode definition, String text, List<Integer> checklist, UUID recordingId) {
        JsonNode written = definition.path("written");
        if (written.isObject()) {
            if (text == null || text.isBlank()) return "Rédigez votre texte avant d’envoyer la mission.";
            int minWords = written.path("minWords").asInt(0);
            if (words(text) < minWords) return "Votre texte doit compter au moins " + minWords + " mots.";
            if (length(text) > written.path("maxChars").asInt(MAX_TEXT) || length(text) > MAX_TEXT) {
                return "Votre texte dépasse la longueur prévue.";
            }
        }
        if (definition.path("oral").isObject() && recordingId == null) {
            return "Enregistrez votre production orale avant d’envoyer la mission.";
        }
        int size = definition.path("checklist").size();
        long checked = checklist == null ? 0 : checklist.stream().filter(index -> index != null && index >= 0 && index < size)
                .distinct().count();
        if (checked < size) return "Cochez chaque point de la liste de vérification avant d’envoyer la mission.";
        return null;
    }

    /**
     * Destinataire d'après les droits de correction d'Identités : le professeur référent, sinon le correcteur
     * désigné ; sans l'un ni l'autre, la mission est envoyée sans retour attendu (auto-vérification seulement).
     */
    static Recipient recipient(JsonNode right) {
        UUID teacherId = uuid(right == null ? null : right.path("teacherId"));
        if (teacherId != null) return new Recipient(SUBMITTED, teacherId, TEACHER);
        UUID reviewerId = uuid(right == null ? null : right.path("reviewerId"));
        if (reviewerId != null) return new Recipient(SUBMITTED, reviewerId, REVIEWER);
        return new Recipient(SENT, null, null);
    }

    /** Reprise permise après « à reprendre » ou après un envoi sans destinataire ; refus (409) sinon, ou null. */
    static String restartRefusal(String status, String decision) {
        if (SENT.equals(status) || REVIEWED.equals(status) && TO_REDO.equals(decision)) return null;
        if (SUBMITTED.equals(status)) return "Votre mission attend le retour de votre professeur.";
        if (REVIEWED.equals(status)) return "Cette mission est déjà validée.";
        return "Cette mission est déjà en cours.";
    }

    /** Retour du correcteur : validated ou to_redo ; un commentaire est requis pour « à reprendre » (400). */
    static String checkReview(String decision, String comment) {
        if (!VALIDATED.equals(decision) && !TO_REDO.equals(decision)) {
            throw HttpError.badRequest("Indiquez « validée » ou « à reprendre ».");
        }
        String text = comment == null ? "" : comment.strip();
        if (length(text) > MAX_COMMENT) throw HttpError.badRequest("Le commentaire compte 2 000 caractères au plus.");
        if (TO_REDO.equals(decision) && text.isEmpty()) {
            throw HttpError.badRequest("Expliquez à l’élève ce qu’il doit reprendre.");
        }
        return text;
    }

    /** Refus d'un retour selon l'état de la mission (409), ou null si elle attend un retour. */
    static String reviewRefusal(String status) {
        return switch (status) {
            case SUBMITTED -> null;
            case REVIEWED -> "Cette mission a déjà reçu son retour.";
            case SENT -> "Cette mission a été envoyée sans professeur : elle n’attend pas de retour.";
            default -> "Cette mission n’est pas encore remise.";
        };
    }

    /**
     * Définition montrée à l'élève et au correcteur : consigne, parties, liste et grille (le titre est à part). La
     * grille est visible dès l'ouverture ; les points n'apparaissent que dans le retour.
     */
    static ObjectNode visibleDefinition(JsonNode definition) {
        ObjectNode visible = JSON.objectNode();
        visible.put("description", definition.path("description").asText(""));
        visible.set("oral", definition.path("oral").isObject() ? definition.get("oral").deepCopy() : JSON.nullNode());
        visible.set("written", definition.path("written").isObject() ? definition.get("written").deepCopy() : JSON.nullNode());
        visible.set("checklist", definition.path("checklist").isArray() ? definition.get("checklist").deepCopy() : JSON.arrayNode());
        visible.set("criteria", criteria(definition).deepCopy());
        return visible;
    }

    private static int bounded(JsonNode value, int min, int max, int fallback) {
        if (value == null || !value.isNumber()) return fallback;
        return Math.max(min, Math.min(max, value.asInt()));
    }

    private static UUID uuid(JsonNode value) {
        if (value == null || !value.isTextual()) return null;
        try {
            return UUID.fromString(value.asText());
        } catch (IllegalArgumentException error) {
            return null;
        }
    }
}
