package org.linguacap.identity;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.linguacap.common.HttpError;

/**
 * Droits de correction (DEV-065, DEV-068), en route interne pour Évaluations : l'administration, le professeur
 * référent de l'élève et le correcteur désigné disposant de la permission Correction peuvent corriger ses
 * productions et les écouter. Les autres comptes reçoivent canGrade à false.
 */
@Path("/v1/internal/identity/graders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GraderResource {
    @Inject Accounts accounts;
    @Inject Database db;

    @POST
    public List<GraderRight> graders(LearnerIds request) {
        Account caller = accounts.current();
        if (request == null || request.learnerIds() == null || request.learnerIds().size() > 200) {
            throw HttpError.badRequest("Liste d’élèves invalide.");
        }
        if (request.learnerIds().isEmpty()) return List.of();
        return db.read("read graders", connection -> {
            List<GraderRight> rights = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select p.id, p.display_name, p.teacher_id, r.reviewer_id
                    from identity.profiles p
                    left join identity.reviewer_assignments r on r.learner_id = p.id and r.ended_at is null
                    where p.id = any(?) and p.role = 'learner'
                    """)) {
                query.setArray(1, connection.createArrayOf("uuid", request.learnerIds().toArray()));
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        UUID teacherId = rows.getObject("teacher_id", UUID.class);
                        UUID reviewerId = rows.getObject("reviewer_id", UUID.class);
                        boolean canGrade = caller.active() && (caller.is("admin")
                                || caller.is("teacher") && caller.id().equals(teacherId)
                                || caller.id().equals(reviewerId) && caller.has("correction"));
                        rights.add(new GraderRight(rows.getObject("id", UUID.class), rows.getString("display_name"),
                                teacherId, reviewerId, canGrade));
                    }
                }
            }
            return rights;
        });
    }

    public record LearnerIds(List<UUID> learnerIds) {}

    public record GraderRight(UUID learnerId, String displayName, UUID teacherId, UUID reviewerId, boolean canGrade) {}
}
