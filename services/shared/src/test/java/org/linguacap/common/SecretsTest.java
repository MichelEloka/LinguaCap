package org.linguacap.common;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class SecretsTest {
    @Test
    void accepteUniquementLaValeurAttendue() {
        assertTrue(Secrets.match("secret-de-liaison", "secret-de-liaison"));
        assertFalse(Secrets.match("secret-de-liaison", "secret-de-liaisoN"));
        assertFalse(Secrets.match("secret-de-liaison", "secret"));
        assertFalse(Secrets.match("secret-de-liaison", null));
    }

    @Test
    void refuseToutQuandAucunSecretNEstConfigure() {
        assertFalse(Secrets.match(null, ""));
        assertFalse(Secrets.match("", ""));
        assertFalse(Secrets.match("   ", "   "));
    }
}
