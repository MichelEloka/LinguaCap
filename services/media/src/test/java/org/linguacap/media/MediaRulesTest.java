package org.linguacap.media;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class MediaRulesTest {
    private static byte[] bytes(int... values) {
        byte[] head = new byte[16];
        for (int index = 0; index < values.length; index++) head[index] = (byte) values[index];
        return head;
    }

    private static byte[] riff(String format) {
        byte[] head = new byte[16];
        System.arraycopy("RIFF".getBytes(StandardCharsets.US_ASCII), 0, head, 0, 4);
        System.arraycopy(format.getBytes(StandardCharsets.US_ASCII), 0, head, 8, 4);
        return head;
    }

    @Test
    void leTypeReelEstLuDansLesPremiersOctets() {
        assertEquals("image/jpeg", MediaRules.detect(bytes(0xFF, 0xD8, 0xFF, 0xE0)));
        assertEquals("image/png", MediaRules.detect(bytes(0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A)));
        assertEquals("image/webp", MediaRules.detect(riff("WEBP")));
        assertEquals("audio/wav", MediaRules.detect(riff("WAVE")));
        assertEquals("audio/mpeg", MediaRules.detect(bytes('I', 'D', '3', 4)));
        assertEquals("audio/mpeg", MediaRules.detect(bytes(0xFF, 0xFB, 0x90, 0x64)));
        assertNull(MediaRules.detect("<html><body>".getBytes(StandardCharsets.US_ASCII)));
        assertNull(MediaRules.detect(riff("AVI ")));
        assertNull(MediaRules.detect(new byte[2]));
    }

    @Test
    void unFichierConformeEstAccepte() {
        assertNull(MediaRules.refusal("image/png", 2048, 2048, bytes(0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A)));
        assertNull(MediaRules.refusal("audio/wav", 15L * 1024 * 1024, 15L * 1024 * 1024, riff("WAVE")));
    }

    @Test
    void unFichierNonConformeEstRefuseAvecSaRaison() {
        String disguised = MediaRules.refusal("image/jpeg", 120, 120, "<script>alert</script>".getBytes(StandardCharsets.US_ASCII));
        assertTrue(disguised.contains("image JPEG"), disguised);
        assertTrue(MediaRules.refusal("image/png", 6L * 1024 * 1024, 6L * 1024 * 1024,
                bytes(0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A)).contains("5 Mo"));
        assertTrue(MediaRules.refusal("audio/mpeg", 100, 40, bytes('I', 'D', '3')).contains("annoncé"));
        assertTrue(MediaRules.refusal("audio/mpeg", 100, 0, bytes()).contains("vide"));
        assertTrue(MediaRules.refusal("video/mp4", 100, 100, bytes()).contains("pas accepté"));
    }

    @Test
    void lIdentifiantEstTireDuTitre() {
        assertEquals("tasse-de-cafe-a-berlin", MediaRules.slug("Tasse de café à Berlin !"));
        assertEquals("media", MediaRules.slug("  ¿¿  "));
        assertEquals("media-uploads", MediaRules.slug("Uploads"));
        assertTrue(MediaRules.slug("x".repeat(80)).length() <= 48);
    }
}
