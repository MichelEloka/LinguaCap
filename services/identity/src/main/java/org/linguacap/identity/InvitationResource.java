package org.linguacap.identity;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.HttpError;

@Path("/v1/invitations")
@Produces(MediaType.APPLICATION_JSON)
public class InvitationResource {
    @Inject Accounts accounts;
    @Inject IdentityStore store;
    @Inject InvitationStore invitations;
    @Inject SupabaseInvites supabase;

    @ConfigProperty(name = "lingua.languages.open", defaultValue = "de")
    String openLanguages;

    /** L'administration voit toutes les invitations, un professeur celles de sa liste. */
    @GET
    public List<Invitation> list() {
        Account caller = accounts.current();
        if (caller.is("admin")) return invitations.list(null);
        if (caller.is("teacher")) return invitations.list(caller.id());
        throw HttpError.forbidden("Les invitations sont réservées aux professeurs et administrateurs.");
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response invite(InvitationRequest request) {
        Account caller = accounts.current();
        if (AccountRules.invitableRoles(caller.role()).isEmpty()) {
            throw HttpError.forbidden("Seuls les professeurs et administrateurs peuvent inviter.");
        }
        if (request == null) {
            throw HttpError.badRequest("Les informations de l’invitation sont requises.");
        }
        String email = AccountRules.checkInvitationFields(request.email(), request.displayName());
        String role = request.role();
        if (role == null || !AccountRules.invitableRoles(caller.role()).contains(role)) {
            throw caller.is("teacher")
                    ? HttpError.forbidden("Un professeur peut inviter des élèves dans sa propre liste.")
                    : HttpError.badRequest("L’invitation doit cibler un professeur, un élève ou un membre de l’équipe.");
        }
        UUID teacherId = resolveTeacher(caller, role, request.teacherId());
        String languageId = AccountRules.checkInvitationLanguage(role, request.languageId(),
                teacherId == null ? List.of() : store.teacherLanguages(teacherId),
                AccountRules.openLanguages(openLanguages));
        supabase.requireConfigured();

        InvitationStore.Row reserved = invitations.reserve(caller, email, request.displayName().strip(), role, teacherId,
                languageId);
        return Response.status(Response.Status.CREATED).entity(send(caller, reserved, reserved.sendCount() > 0)).build();
    }

    @POST
    @Path("/{id}/resend")
    public Invitation resend(@PathParam("id") UUID id) {
        Account caller = accounts.current();
        authorize(caller, id);
        supabase.requireConfigured();
        return send(caller, invitations.extend(id), true);
    }

    @POST
    @Path("/{id}/cancel")
    public Invitation cancel(@PathParam("id") UUID id) {
        Account caller = accounts.current();
        authorize(caller, id);
        return invitations.cancel(id, caller.id(), accounts.requestId()).view();
    }

    private Invitation send(Account caller, InvitationStore.Row invitation, boolean reissued) {
        UUID userId = supabase.send(invitation.email(), invitation.displayName(), invitation.invitedUserId());
        return invitations.markSent(invitation.id(), userId, caller.id(), reissued, accounts.requestId()).view();
    }

    private void authorize(Account caller, UUID id) {
        InvitationStore.Row invitation = invitations.find(id);
        boolean visible = invitation != null && (caller.is("admin") || caller.is("teacher")
                && (caller.id().equals(invitation.teacherId()) || caller.id().equals(invitation.invitedBy())));
        if (!visible) throw HttpError.notFound("Invitation introuvable.");
    }

    private UUID resolveTeacher(Account caller, String role, UUID requestedTeacher) {
        if (caller.is("teacher")) {
            if (requestedTeacher != null && !caller.id().equals(requestedTeacher)) {
                throw HttpError.forbidden("Un professeur peut inviter des élèves dans sa propre liste.");
            }
            return caller.id();
        }
        if (requestedTeacher == null) return null;
        if (!"learner".equals(role)) {
            throw HttpError.badRequest("Le rattachement est réservé aux élèves.");
        }
        Account teacher = store.findAccount(requestedTeacher);
        if (teacher == null || !teacher.is("teacher") || !teacher.active()) {
            throw HttpError.badRequest("Le professeur sélectionné est introuvable ou désactivé.");
        }
        return requestedTeacher;
    }

    /**
     * languageId (facultatif, élèves seulement) : langue apprise, parmi les langues ouvertes et celles du professeur
     * référent. Sans langue, l'élève reçoit à l'activation la première langue de son professeur, ou la choisit.
     */
    public record InvitationRequest(String email, String displayName, String role, UUID teacherId, String languageId) {}

    public record Invitation(UUID id, String email, String displayName, String role, UUID teacherId,
                             String teacherName, String languageId, UUID invitedBy, String invitedByName, String status, int sendCount,
                             String createdAt, String sentAt, String lastSentAt, String expiresAt,
                             String cancelledAt, String acceptedAt) {}
}
