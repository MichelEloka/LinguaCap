package org.linguacap.assessment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ExamRulesTest {
    private static final ObjectMapper JSON = new ObjectMapper();

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    private static final JsonNode EXAM = json("""
            {'kind':'final','parts':[
              {'id':'lecture','competence':'lecture','mode':'closed','title':'Lecture','questions':[
                {'id':'q1','options':[{'id':'a','correct':true},{'id':'b','correct':false}]},
                {'id':'q2','options':[{'id':'a','correct':false},{'id':'b','correct':true}]}]},
              {'id':'ecrit','competence':'expression-ecrite','mode':'written','title':'Écrire','criteria':[
                {'id':'clarte','label':'Clarté','maxPoints':5},{'id':'langue','label':'Langue','maxPoints':5}]},
              {'id':'oral','competence':'expression-orale','mode':'oral','title':'Parler','criteria':[
                {'id':'aisance','label':'Aisance','maxPoints':10}]}]}
            """);

    @Test
    void lElèveNeReçoitPasLeCorrigé() {
        JsonNode visible = ExamRules.withoutAnswers(EXAM);
        assertFalse(visible.toString().contains("correct"));
        assertTrue(EXAM.toString().contains("correct"), "La définition figée garde son corrigé");
        assertTrue(ExamRules.needsGrading(EXAM));
    }

    @Test
    void laProgressionNAccepteQueLesChoixDeLEvaluation() {
        ExamRules.checkProgress(EXAM, json("{'lecture':{'q1':'a'}}"), json("{'ecrit':'Ich möchte…'}"));
        assertThrows(WebApplicationException.class, () -> ExamRules.checkProgress(EXAM, json("{'lecture':{'q1':'z'}}"), null));
        assertThrows(WebApplicationException.class, () -> ExamRules.checkProgress(EXAM, json("{'ecrit':{'q1':'a'}}"), null));
        assertThrows(WebApplicationException.class, () -> ExamRules.checkProgress(EXAM, null, json("{'oral':'texte'}")));
    }

    @Test
    void laRemiseExigeLesProductions() {
        assertEquals(2, ExamRules.missing(EXAM, json("{}"), json("{}")).size());
        assertEquals(List.of(), ExamRules.missing(EXAM, json("{'ecrit':'Hallo'}"), json("{'oral':'7c9e'}")));
    }

    @Test
    void lesQuestionsFerméesSontCorrigéesEtLaGrilleBornée() {
        Map<String, ExamRules.Score> closed = ExamRules.closedScores(EXAM, json("{'lecture':{'q1':'a','q2':'a'}}"));
        assertEquals(new ExamRules.Score(1, 2), closed.get("lecture"));
        Map<String, ExamRules.Score> graded = ExamRules.gradedScores(EXAM,
                json("{'ecrit':{'points':{'clarte':4,'langue':3}},'oral':{'points':{'aisance':7}}}"));
        assertEquals(new ExamRules.Score(7, 10), graded.get("ecrit"));
        assertThrows(WebApplicationException.class, () -> ExamRules.gradedScores(EXAM,
                json("{'ecrit':{'points':{'clarte':6,'langue':3}},'oral':{'points':{'aisance':7}}}")));
        assertThrows(WebApplicationException.class, () -> ExamRules.gradedScores(EXAM, json("{'ecrit':{'points':{'clarte':4,'langue':3}}}")));
        assertThrows(WebApplicationException.class, () -> ExamRules.gradedScores(EXAM,
                json("{'ecrit':{'points':{'clarte':4,'langue':3,'autre':1}},'oral':{'points':{'aisance':7}}}")));
    }

    @Test
    void laDécisionRegardeLeScoreGlobalEtChaqueCompétence() {
        Map<String, ExamRules.Score> parts = new LinkedHashMap<>();
        parts.put("lecture", new ExamRules.Score(2, 2));
        parts.put("ecrit", new ExamRules.Score(7, 10));
        parts.put("oral", new ExamRules.Score(6, 10));
        ExamRules.Result passed = ExamRules.result(EXAM, parts, 60, "final");
        assertEquals("validated", passed.decision());
        assertEquals(68, passed.percent());
        assertEquals(List.of(), passed.weakCompetences());

        parts.put("oral", new ExamRules.Score(2, 10));
        ExamRules.Result weak = ExamRules.result(EXAM, parts, 50, "final");
        assertEquals("to_consolidate", weak.decision(), "Une compétence sous la moitié du seuil empêche la validation");
        assertEquals(List.of("expression-orale"), weak.weakCompetences());
        assertEquals("completed", ExamRules.result(EXAM, parts, 50, "midterm").decision());
    }

    @Test
    void lesActivitésÀRevoirSuiventLesCompétencesFaibles() {
        JsonNode track = json("""
                {'modules':[{'id':'cafe','title':'Au café','activities':[
                  {'id':'lecon','title':'Leçon','competences':['ecoute']},
                  {'id':'oral','title':'Commander','competences':['expression-orale']}]}]}
                """);
        JsonNode review = ExamRules.review(JSON, track, List.of("expression-orale"));
        assertEquals(1, review.size());
        assertEquals("oral", review.get(0).path("activityId").asText());
        assertEquals(0, ExamRules.review(JSON, track, List.of()).size());
    }
}
