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
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;

@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
public class IdentityResource {
    private static final Pattern EMAIL = Pattern.compile("[^\\s@]+@[^\\s@]+\\.[^\\s@]+");

    @Inject Actor actor;
    @Inject IdentityStore store;
    @Inject SupabaseInvites supabase;

    @GET
    @Path("/me")
    public CurrentProfile me() {
        Profile profile = currentProfile();
        return new CurrentProfile(profile.id(), profile.displayName(), profile.role());
    }

    @GET
    @Path("/learners")
    public List<Profile> learners() {
        Profile caller = currentProfile();
        if ("admin".equals(caller.role())) {
            return store.learners(null);
        }
        if ("teacher".equals(caller.role())) {
            return store.learners(caller.id());
        }
        throw HttpError.forbidden("La liste des élèves est réservée aux professeurs et administrateurs.");
    }

    @GET
    @Path("/learners/{id}")
    public Profile learner(@PathParam("id") UUID id) {
        Profile caller = currentProfile();
        Profile learner = store.findProfile(id);
        if (learner == null || !"learner".equals(learner.role())) {
            throw HttpError.notFound("Élève introuvable.");
        }
        if ("admin".equals(caller.role())
                || ("teacher".equals(caller.role()) && caller.id().equals(learner.teacherId()))
                || caller.id().equals(learner.id())) {
            return learner;
        }
        throw HttpError.forbidden("Tu ne peux pas consulter cet élève.");
    }

    @POST
    @Path("/invitations")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response invite(InvitationRequest request) {
        Profile caller = currentProfile();
        if (!"admin".equals(caller.role()) && !"teacher".equals(caller.role())) {
            throw HttpError.forbidden("Seuls les professeurs et administrateurs peuvent inviter.");
        }
        if (request == null) {
            throw HttpError.badRequest("Les informations de l’invitation sont requises.");
        }

        String email = normalizeEmail(request.email());
        String name = request.displayName() == null ? "" : request.displayName().strip();
        String role = request.role();
        if (email.length() > 254 || !EMAIL.matcher(email).matches()) {
            throw HttpError.badRequest("L’adresse e-mail est invalide.");
        }
        if (name.isEmpty() || name.length() > 140) {
            throw HttpError.badRequest("Le nom doit contenir entre 1 et 140 caractères.");
        }
        if (!"teacher".equals(role) && !"learner".equals(role)) {
            throw HttpError.badRequest("L’invitation doit cibler un professeur ou un élève.");
        }

        UUID teacherId = resolveTeacher(caller, role, request.teacherId());
        supabase.requireConfigured();
        IdentityStore.Invitation invitation = store.reserveInvitation(email, name, role, teacherId, caller.id());
        if (!invitation.role().equals(role)
                || !Objects.equals(invitation.teacherId(), teacherId)
                || !invitation.displayName().equals(name)
                || invitation.accepted()) {
            throw HttpError.conflict("Une invitation existe déjà pour cette adresse.");
        }

        UUID userId = supabase.send(invitation.email(), invitation.displayName());
        IdentityStore.Invitation sent = store.markSent(invitation.id(), userId);
        return Response.status(Response.Status.CREATED)
                .entity(new InvitationReceipt(sent.id(), sent.email(), sent.displayName(), sent.role(),
                        sent.teacherId(), sent.accepted() ? "accepted" : "sent"))
                .build();
    }

    private UUID resolveTeacher(Profile caller, String targetRole, UUID requestedTeacher) {
        if ("teacher".equals(caller.role())) {
            if (!"learner".equals(targetRole)
                    || (requestedTeacher != null && !caller.id().equals(requestedTeacher))) {
                throw HttpError.forbidden("Un professeur peut inviter des élèves dans sa propre liste.");
            }
            return caller.id();
        }
        if (requestedTeacher != null) {
            if (!"learner".equals(targetRole)) {
                throw HttpError.badRequest("Le rattachement est réservé aux élèves.");
            }
            Profile teacher = store.findProfile(requestedTeacher);
            if (teacher == null || !"teacher".equals(teacher.role())) {
                throw HttpError.badRequest("Le professeur sélectionné est introuvable.");
            }
        }
        return requestedTeacher;
    }

    private Profile currentProfile() {
        UUID id = actor.id();
        Profile profile = store.findProfile(id);
        String verifiedEmail = normalizeEmail(actor.email());
        if (profile == null && actor.emailVerified() && !verifiedEmail.isEmpty()) {
            profile = store.activateInvitation(id, verifiedEmail);
        }
        if (profile == null) {
            throw HttpError.forbidden("Ce compte ne dispose pas encore d’un accès à LinguaCap.");
        }
        return profile;
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.strip().toLowerCase(Locale.ROOT);
    }

    public record CurrentProfile(UUID id, String displayName, String role) {}
    public record Profile(UUID id, String displayName, String role, UUID teacherId) {}
    public record InvitationRequest(String email, String displayName, String role, UUID teacherId) {}
    public record InvitationReceipt(UUID id, String email, String displayName, String role, UUID teacherId,
            String status) {}
}
