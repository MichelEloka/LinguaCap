package org.linguacap.tracking;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TeacherOnboardingKpisTest {
    @Test
    void lesReponsesAbsentesRestentInconnuesDansLesRepartitions() throws Exception {
        var profiles = new ObjectMapper().readTree("""
                [
                  {"languages":["de","en"],"levels":["A1","A2"],"acceptingNewStudents":true,
                   "courseCreationMode":"self","maxLearners":15,"gradingDelayHours":48},
                  {"languages":["de"],"levels":["B1"],"acceptingNewStudents":false,
                   "courseCreationMode":"linguacap","maxLearners":null,"gradingDelayHours":168},
                  {"languages":[],"levels":[],"acceptingNewStudents":null,"courseCreationMode":null}
                ]
                """);
        var result = TeacherOnboardingKpis.compute(profiles, List.of());

        assertEquals(3, result.teachers());
        assertEquals(Map.of("de", 2, "en", 1, "unknown", 1), result.byLanguage());
        assertEquals(Map.of("A1", 1, "A2", 1, "B1", 1, "unknown", 1), result.byLevel());
        assertEquals(Map.of("yes", 1, "no", 1, "unknown", 1), result.byAvailability());
        assertEquals(Map.of("self", 1, "linguacap", 1, "unknown", 1), result.byCourseMode());
        assertEquals(Map.of("15", 1, "unknown", 2), result.byMaxLearners());
        assertEquals(Map.of("48", 1, "168", 1, "unknown", 1), result.byGradingDelayHours());
        assertTrue(result.trend().isEmpty());
    }
}
