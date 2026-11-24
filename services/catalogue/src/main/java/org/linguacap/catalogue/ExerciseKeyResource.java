package org.linguacap.catalogue;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.linguacap.catalogue.QuestionViews.KeyQuestion;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;

/**
 * Clé de correction d'un exercice, toutes questions typées comprises (route interne pour Évaluations, jamais
 * exposée par la passerelle). Elle reprend les identifiants opaques et l'ordre affiché de la vue élève : Évaluations
 * corrige la remise sans recalculer la vue. frozen : la version de la leçon est publiée ou retirée, donc figée ; la
 * clé peut être gardée en cache. Une leçon sans version (leçon historique, questions « après » d'une séquence de film
 * du Ciné-club, que l'éditeur peut réenregistrer) n'est jamais figée : Évaluations la relit à chaque remise. Aucune
 * clé pour une leçon de brouillon ou d'un film en brouillon (aucun élève ne la reçoit, l'aperçu de l'éditeur ne remet
 * rien) ni pour un diagnostic, qui se remet sans corrigé : sinon une remise d'essai par /assessments/exercises
 * révélerait ses réponses avant le vrai passage.
 */
@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
public class ExerciseKeyResource {
    @Inject AgroalDataSource dataSource;
    @Inject Actor actor;

    @GET
    @Path("/internal/lessons/{lessonId}/exercise-key")
    public ExerciseKey exerciseKey(@PathParam("lessonId") String lessonId) {
        actor.id();
        if (!lessonId.matches("[a-z0-9-]{1,64}")) throw HttpError.badRequest("Identifiant de leçon invalide.");
        try (var connection = dataSource.getConnection()) {
            ExerciseKey key = key(connection, lessonId);
            if (key == null) throw HttpError.notFound("Corrigé indisponible pour cette leçon.");
            return key;
        } catch (SQLException error) {
            throw HttpError.unavailable("Le corrigé est temporairement indisponible.");
        }
    }

    /** Clé de la leçon si elle est corrigeable (lisible hors édition, hors diagnostic, avec des questions), sinon null. */
    static ExerciseKey key(Connection connection, String lessonId) throws SQLException {
        UUID versionId;
        try (var query = connection.prepareStatement("""
                select l.version_id
                from catalogue.lessons l
                join catalogue.levels n on n.id = l.level_id
                left join catalogue.track_versions v on v.id = l.version_id
                where l.id = ? and %s
                  and not exists (select 1 from catalogue.track_versions d where d.diagnostic_lesson_id = l.id)
                """.formatted(CatalogueResource.READABLE_LESSON))) {
            query.setString(1, lessonId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                versionId = rows.getObject("version_id", UUID.class);
            }
        }
        List<KeyQuestion> questions = QuestionViews.key(lessonId, QuestionViews.read(connection, lessonId));
        if (questions.isEmpty()) return null;
        return new ExerciseKey(lessonId, versionId, versionId != null, questions);
    }

    /** Clé d'un exercice : une entrée par question servie à l'élève, dans le même ordre. */
    public record ExerciseKey(String lessonId, UUID versionId, boolean frozen, List<KeyQuestion> questions) {}
}
