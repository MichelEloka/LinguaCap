package org.linguacap.identity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.HttpError;

@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
public class IdentityResource {
    @Inject Accounts accounts;
    @Inject IdentityStore store;
    @Inject ObjectMapper json;

    @ConfigProperty(name = "lingua.languages.open", defaultValue = "de")
    String openLanguages;

    @GET
    @Path("/me")
    public CurrentProfile me() {
        return current(accounts.current());
    }

    /** Langue apprise par l'élève autonome (l'élève accompagné reçoit celle de son professeur). */
    @PUT
    @Path("/me/language")
    @Consumes(MediaType.APPLICATION_JSON)
    public CurrentProfile language(LanguageChoice request) {
        Account caller = accounts.current();
        String languageId = AccountRules.checkLanguageChoice(caller,
                request == null ? null : request.languageId(), open());
        store.chooseLanguage(caller, languageId, accounts.requestId());
        return current(store.findAccount(caller.id()));
    }

    /** Questionnaire d'accueil du professeur : langues et niveaux enseignés, disponibilité et présentation. */
    @PUT
    @Path("/me/teacher-profile")
    @Consumes(MediaType.APPLICATION_JSON)
    public CurrentProfile teacherProfile(JsonNode body) {
        Account caller = accounts.current();
        if (!caller.is("teacher")) {
            throw HttpError.forbidden("Le profil enseignant est réservé aux professeurs.");
        }
        store.saveTeacherProfile(caller.id(), AccountRules.checkTeacherProfile(teacherProfileRequest(body), open()),
                accounts.requestId());
        return current(caller);
    }

    private TeacherProfileRequest teacherProfileRequest(JsonNode body) {
        if (body == null || !body.isObject()) {
            throw HttpError.badRequest("Le questionnaire doit être un objet JSON.");
        }
        if ((body.has("acceptingNewStudents") || body.has("courseCreationMode"))
                && (!body.path("acceptingNewStudents").isBoolean() || !body.path("courseCreationMode").isTextual())) {
            throw HttpError.badRequest("Indiquez votre disponibilité et comment vous souhaitez construire vos cours.");
        }
        try {
            return json.treeToValue(body, TeacherProfileRequest.class);
        } catch (JsonProcessingException error) {
            throw HttpError.badRequest("Vérifiez les réponses du questionnaire.");
        }
    }

    /** Professeur référent de l'élève connecté, ou null pour un élève autonome. */
    @GET
    @Path("/me/teacher")
    public JsonNode teacher() {
        Account caller = accounts.current();
        if (!caller.is("learner")) {
            throw HttpError.forbidden("Cette information est réservée aux élèves.");
        }
        if (!caller.accompanied()) return NullNode.getInstance();
        Account teacher = store.findAccount(caller.teacherId());
        if (teacher == null) return NullNode.getInstance();
        TeacherProfile profile = store.teacherProfile(teacher.id());
        if (profile == null) profile = TeacherProfile.EMPTY;
        return json.valueToTree(new TeacherCard(teacher.id(), teacher.displayName(), profile.bio(),
                profile.gradingDelayHours(), profile.languages()));
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

    /** Profil de l'appelant ; le profil enseignant n'est joint qu'aux professeurs (vide avant le questionnaire). */
    private CurrentProfile current(Account account) {
        TeacherProfile teacherProfile = null;
        if (account.is("teacher")) {
            teacherProfile = store.teacherProfile(account.id());
            if (teacherProfile == null) teacherProfile = TeacherProfile.EMPTY;
        }
        return new CurrentProfile(account.id(), account.displayName(), account.role(),
                account.permissions().stream().sorted().toList(), account.languageId(),
                account.is("learner") ? account.teacherId() : null, teacherProfile);
    }

    private Set<String> open() {
        return AccountRules.openLanguages(openLanguages);
    }

    public record CurrentProfile(UUID id, String displayName, String role, List<String> permissions,
                                 String languageId, UUID teacherId, TeacherProfile teacherProfile) {}

    public record Profile(UUID id, String displayName, String role, UUID teacherId, String languageId) {}

    public record LanguageChoice(String languageId) {}

    /** Les deux choix sont fournis ensemble ; leur absence laisse les réponses précédentes inchangées. */
    public record TeacherProfileRequest(List<String> languages, List<String> levels, Integer maxLearners,
                                        Integer gradingDelayHours, String bio, Boolean acceptingNewStudents,
                                        String courseCreationMode) {}

    /** onboardedAt : première validation du questionnaire (null tant qu'il reste à remplir). */
    public record TeacherProfile(List<String> languages, List<String> levels, Integer maxLearners,
                                 Integer gradingDelayHours, String bio, String onboardedAt,
                                 Boolean acceptingNewStudents, String courseCreationMode) {
        static final TeacherProfile EMPTY = new TeacherProfile(List.of(), List.of(), null, null, "", null, null, null);
    }

    public record TeacherCard(UUID id, String displayName, String bio, Integer gradingDelayHours,
                              List<String> languages) {}
}
