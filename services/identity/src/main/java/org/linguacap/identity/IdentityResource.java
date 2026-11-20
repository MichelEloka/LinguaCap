package org.linguacap.identity;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.UUID;
import org.linguacap.common.HttpError;

@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
public class IdentityResource {
    @Inject Accounts accounts;
    @Inject IdentityStore store;

    @GET
    @Path("/me")
    public CurrentProfile me() {
        Account account = accounts.current();
        return new CurrentProfile(account.id(), account.displayName(), account.role(),
                account.permissions().stream().sorted().toList());
    }

    @GET
    @Path("/learners")
    public List<Profile> learners() {
        Account caller = accounts.current();
        if (caller.is("admin")) return store.learners(null);
        if (caller.is("teacher")) return store.learners(caller.id());
        throw HttpError.forbidden("La liste des élèves est réservée aux professeurs et administrateurs.");
    }

    @GET
    @Path("/learners/{id}")
    public Profile learner(@PathParam("id") UUID id) {
        Account caller = accounts.current();
        Account learner = store.findAccount(id);
        if (learner == null || !learner.is("learner")) {
            throw HttpError.notFound("Élève introuvable.");
        }
        if (caller.is("admin")
                || (caller.is("teacher") && caller.id().equals(learner.teacherId()))
                || caller.id().equals(learner.id())) {
            return learner.toProfile();
        }
        throw HttpError.forbidden("Tu ne peux pas consulter cet élève.");
    }

    public record CurrentProfile(UUID id, String displayName, String role, List<String> permissions) {}
    public record Profile(UUID id, String displayName, String role, UUID teacherId) {}
}
