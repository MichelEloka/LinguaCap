package org.linguacap.common;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class Secrets {
    private Secrets() {}

    public static boolean match(String expected, String given) {
        return expected != null && !expected.isBlank() && given != null
                && MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                given.getBytes(StandardCharsets.UTF_8));
    }
}
