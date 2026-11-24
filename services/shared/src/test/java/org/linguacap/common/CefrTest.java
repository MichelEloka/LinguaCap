package org.linguacap.common;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class CefrTest {
    @Test
    void lÉchelleDonneLeRangEtLOrdre() {
        assertEquals(0, Cefr.rank("A0"));
        assertEquals(1, Cefr.rank("A1"));
        assertEquals(3, Cefr.rank("B1"));
        assertEquals(6, Cefr.rank("C2"));
        assertEquals(-1, Cefr.rank("Z9"));
        assertEquals(-1, Cefr.rank(null));
        assertEquals("B2", Cefr.levelOfRank(4));
        assertNull(Cefr.levelOfRank(0), "A0 n'est pas un niveau de l'échelle");
        assertNull(Cefr.levelOfRank(7));
        List<String> codes = new ArrayList<>(List.of("C1", "A2", "A0", "B1"));
        codes.sort(Cefr.ORDER);
        assertEquals(List.of("A0", "A2", "B1", "C1"), codes);
    }

    @Test
    void leNiveauSuivantEtLesCodesValides() {
        assertEquals("A1", Cefr.next("A0"));
        assertEquals("B2", Cefr.next("B1"));
        assertNull(Cefr.next("C2"));
        assertNull(Cefr.next("Z9"));
        assertTrue(Cefr.isLevel("B2"));
        assertFalse(Cefr.isLevel("A0"));
        assertFalse(Cefr.isLevel("b1"), "Les codes sont en majuscules");
        assertTrue(Cefr.isStartLevel("A0"));
        assertTrue(Cefr.isStartLevel("C1"));
        assertFalse(Cefr.isStartLevel("C2"), "Rien au-dessus de C2");
        assertFalse(Cefr.isStartLevel(null));
    }

    @Test
    void lesLibellésSontGénériques() {
        assertEquals("B1 · Seuil", Cefr.label("B1"));
        assertEquals("Débutant", Cefr.label("A0"));
        assertEquals("X1", Cefr.label("X1"));
    }
}
