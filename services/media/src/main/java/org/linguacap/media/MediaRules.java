package org.linguacap.media;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Règles des fichiers pédagogiques : types acceptés, tailles maximales et signature du contenu (DEV-051). */
final class MediaRules {
    static final long IMAGE_MAX_BYTES = 5L * 1024 * 1024;
    static final long AUDIO_MAX_BYTES = 15L * 1024 * 1024;
    static final int HEAD_BYTES = 16;
    /** Productions orales des élèves : enregistrement du navigateur (WebM, Ogg, MP4) ou fichier MP3 ou WAV. */
    static final long PRODUCTION_MAX_BYTES = 25L * 1024 * 1024;
    private static final Map<String, String> PRODUCTION_EXTENSIONS = Map.of(
            "audio/webm", "webm", "audio/ogg", "ogg", "audio/mp4", "m4a", "audio/mpeg", "mp3", "audio/wav", "wav");

    private static final Map<String, String> KINDS = Map.of(
            "image/jpeg", "image", "image/png", "image", "image/webp", "image",
            "audio/mpeg", "audio", "audio/wav", "audio");
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", "jpg", "image/png", "png", "image/webp", "webp", "audio/mpeg", "mp3", "audio/wav", "wav");
    /** Segments de chemin réservés par les routes de la médiathèque. */
    private static final Set<String> RESERVED = Set.of("uploads", "publish", "internal", "versions");

    private MediaRules() {}

    /** « image » ou « audio », ou null si le type n'est pas accepté. */
    static String kind(String mimeType) {
        return mimeType == null ? null : KINDS.get(mimeType);
    }

    static String extension(String mimeType) {
        return EXTENSIONS.get(mimeType);
    }

    static long maxBytes(String kind) {
        return "image".equals(kind) ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
    }

    /** Type réel déduit des premiers octets, indépendamment du nom et du type déclarés par le navigateur. */
    static String detect(byte[] head) {
        if (head == null || head.length < 4) return null;
        if (starts(head, 0xFF, 0xD8, 0xFF)) return "image/jpeg";
        if (starts(head, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A)) return "image/png";
        if (head.length >= 12 && starts(head, 'R', 'I', 'F', 'F')) {
            String format = new String(head, 8, 4, java.nio.charset.StandardCharsets.US_ASCII);
            if (format.equals("WEBP")) return "image/webp";
            if (format.equals("WAVE")) return "audio/wav";
            return null;
        }
        if (starts(head, 0x1A, 0x45, 0xDF, 0xA3)) return "audio/webm";
        if (starts(head, 'O', 'g', 'g', 'S')) return "audio/ogg";
        if (head.length >= 8 && head[4] == 'f' && head[5] == 't' && head[6] == 'y' && head[7] == 'p') return "audio/mp4";
        if (starts(head, 'I', 'D', '3')) return "audio/mpeg";
        // Trame MPEG audio sans étiquette ID3 : 11 bits de synchronisation à 1.
        if ((head[0] & 0xFF) == 0xFF && (head[1] & 0xE0) == 0xE0) return "audio/mpeg";
        return null;
    }

    /** Raison du refus, ou null si le fichier reçu respecte les règles du type déclaré. */
    static String refusal(String declaredMime, long declaredSize, long size, byte[] head) {
        String kind = kind(declaredMime);
        if (kind == null) return "Ce type de fichier n’est pas accepté.";
        if (size <= 0) return "Le fichier reçu est vide.";
        if (size > maxBytes(kind)) {
            return "Le fichier dépasse la taille maximale de " + maxBytes(kind) / (1024 * 1024) + " Mo pour " +
                    ("image".equals(kind) ? "une image." : "un son.");
        }
        if (size != declaredSize) return "Le fichier reçu ne correspond pas au fichier annoncé : relancez le dépôt.";
        String detected = detect(head);
        if (!declaredMime.equals(detected)) {
            return "Le contenu du fichier ne correspond pas à son type (" + label(declaredMime) + " attendu).";
        }
        return null;
    }

    static String productionExtension(String mimeType) {
        return mimeType == null ? null : PRODUCTION_EXTENSIONS.get(mimeType);
    }

    /** Raison du refus d'un enregistrement d'élève, ou null s'il est conforme. */
    static String productionRefusal(String declaredMime, long declaredSize, long size, byte[] head) {
        if (productionExtension(declaredMime) == null) return "Ce format d’enregistrement n’est pas accepté.";
        if (size <= 0) return "L’enregistrement reçu est vide.";
        if (size > PRODUCTION_MAX_BYTES) return "L’enregistrement dépasse 25 Mo.";
        if (size != declaredSize) return "L’enregistrement reçu ne correspond pas à celui annoncé : relancez l’envoi.";
        if (!declaredMime.equals(detect(head))) return "Le fichier n’est pas un enregistrement audio lisible.";
        return null;
    }

    static String label(String mimeType) {
        return switch (mimeType) {
            case "image/jpeg" -> "image JPEG";
            case "image/png" -> "image PNG";
            case "image/webp" -> "image WebP";
            case "audio/mpeg" -> "son MP3";
            case "audio/wav" -> "son WAV";
            default -> mimeType;
        };
    }

    /** Identifiant lisible tiré du titre : minuscules sans accents, chiffres et tirets. */
    static String slug(String title) {
        String plain = Normalizer.normalize(title == null ? "" : title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (plain.length() > 48) plain = plain.substring(0, 48).replaceAll("-+$", "");
        if (plain.isEmpty() || RESERVED.contains(plain)) plain = "media" + (plain.isEmpty() ? "" : "-" + plain);
        return plain;
    }

    private static boolean starts(byte[] head, int... expected) {
        if (head.length < expected.length) return false;
        for (int index = 0; index < expected.length; index++) {
            if ((head[index] & 0xFF) != expected[index]) return false;
        }
        return true;
    }
}
