package org.linguacap.identity;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.UUID;
import org.linguacap.common.HttpError;

/** Gestion des comptes par l'administration (DEV-022, DEV-023). Les nouveaux droits s'appliquent dès la requête suivante. */
@Path("/v1/admin/users")
@Produces(MediaType.APPLICATION_JSON)
public class AdminUserResource {
    @Inject Accounts accounts;
    @Inject IdentityStore store;

    @GET
    public List<AdminUser> list() {
        accounts.requireAdmin();
        return store.users();
    }

    @GET
    @Path("/{id}")
    public AdminUserDetail detail(@PathParam("id") UUID id) {
        accounts.requireAdmin();
        return store.user(id);
    }

    @PUT
    @Path("/{id}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    public AdminUserDetail status(@PathParam("id") UUID id, StatusChange change) {
        Account caller = accounts.requireAdmin();
        store.updateStatus(caller.id(), id, required(change).status(), accounts.requestId());
        return store.user(id);
    }

    @PUT
    @Path("/{id}/role")
    @Consumes(MediaType.APPLICATION_JSON)
    public AdminUserDetail role(@PathParam("id") UUID id, RoleChange change) {
        Account caller = accounts.requireAdmin();
        store.updateRole(caller.id(), id, required(change).role(), accounts.requestId());
        return store.user(id);
    }

    @PUT
    @Path("/{id}/permissions")
    @Consumes(MediaType.APPLICATION_JSON)
    public AdminUserDetail permissions(@PathParam("id") UUID id, PermissionsChange change) {
        Account caller = accounts.requireAdmin();
        store.replacePermissions(caller.id(), id, required(change).permissions(), accounts.requestId());
        return store.user(id);
    }

    /** Réaffecte un élève à un professeur, ou le rend autonome avec teacherId null. */
    @PUT
    @Path("/{id}/teacher")
    @Consumes(MediaType.APPLICATION_JSON)
    public AdminUserDetail teacher(@PathParam("id") UUID id, TeacherChange change) {
        Account caller = accounts.requireAdmin();
        store.assignTeacher(caller.id(), id, required(change).teacherId(), accounts.requestId());
        return store.user(id);
    }

    /** Désigne le correcteur d'un élève autonome, ou retire la désignation avec reviewerId null. */
    @PUT
    @Path("/{id}/reviewer")
    @Consumes(MediaType.APPLICATION_JSON)
    public AdminUserDetail reviewer(@PathParam("id") UUID id, ReviewerChange change) {
        Account caller = accounts.requireAdmin();
        store.assignReviewer(caller.id(), id, required(change).reviewerId(), accounts.requestId());
        return store.user(id);
    }

    private static <T> T required(T change) {
        if (change == null) throw HttpError.badRequest("Un objet JSON est attendu.");
        return change;
    }

    public record StatusChange(String status) {}
    public record RoleChange(String role) {}
    public record PermissionsChange(List<String> permissions) {}
    public record TeacherChange(UUID teacherId) {}
    public record ReviewerChange(UUID reviewerId) {}

    /** languageId : langue apprise par un élève (null pour l'équipe et pour un élève autonome qui ne l'a pas choisie). */
    public record AdminUser(UUID id, String displayName, String email, String role, String status,
                            List<String> permissions, UUID teacherId, String teacherName, String languageId,
                            UUID reviewerId, String reviewerName, String invitedAt, String activatedAt,
                            String lastSeenAt, String createdAt, String disabledAt) {}

    public record Assignment(UUID personId, String personName, UUID assignedBy, String assignedByName,
                             String startedAt, String endedAt) {}

    public record AdminUserDetail(AdminUser user, List<Assignment> teacherHistory, List<Assignment> reviewerHistory) {}
}
