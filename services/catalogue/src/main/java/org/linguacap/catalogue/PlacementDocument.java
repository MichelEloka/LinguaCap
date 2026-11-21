package org.linguacap.catalogue;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.linguacap.catalogue.VersionDocument.Checks;
import org.linguacap.catalogue.VersionDocument.Issue;
import org.linguacap.catalogue.VersionDocument.MediaRef;
import org.linguacap.catalogue.VersionDocument.Option;
import org.linguacap.common.HttpError;

/**
 * Banque du test de niveau d'une langue : paliers successifs (A1, A2, B1…) de questions fermées de lecture et d'écoute,
 * avec corrigés et supports. Un brouillon s'enregistre d'un bloc et peut rester incomplet ; la publication exige une
 * banque complète. Évaluations tire au hasard drawCount questions par palier, au prorata des compétences de la banque.
 */
public record PlacementDocument(UUID id, String languageId, int number, String status, String title, String description,
                                List<Tier> tiers, String updatedAt, String publishedAt) {

    static final List<String> LEVELS = List.of("A1", "A2", "B1", "B2", "C1", "C2");
    static final Set<String> COMPETENCES = Set.of("lecture", "ecoute");
    static final Set<String> USAGES = Set.of("audio", "illustration");
    static final Set<String> TRANSCRIPTS = Set.of("hidden", "on_demand", "after_answer");
    /** Choix « Je ne sais pas » ajouté par Évaluations à chaque question : identifiant réservé. */
    static final String DONT_KNOW = "dontknow";
    /** Un énoncé de lecture contient le texte à lire (courriel, annonce, article) suivi de la question. */
    static final int MAX_PROMPT = 1500;

    /** Palier : réussi si le score atteint passPercent et qu'aucune compétence n'est sous minCompetencePercent. */
    public record Tier(String code, String title, int passPercent, int minCompetencePercent, int drawCount,
                       List<Question> questions) {}

    /** moduleRef (facultatif) : module du parcours de ce niveau évalué par la question, pour les statistiques. */
    public record Question(String id, String competence, String moduleRef, String prompt, List<Option> options,
                           List<Placement> placements) {}

    /** Support d'une question : son (écoute) ou image, dans une version précise de la médiathèque. */
    public record Placement(String assetId, int assetVersion, String usage, String alt, String caption,
                            String transcriptVisibility, boolean decorative) {}

    /** Contenu modifiable d'un brouillon ; le document complet relu par l'éditeur peut être renvoyé tel quel. */
    @JsonIgnoreProperties({"id", "languageId", "number", "status", "updatedAt", "publishedAt"})
    public record Content(String title, String description, List<Tier> tiers) {}

    public record Summary(UUID id, String languageId, int number, String status, String title, int questionCount,
                          String updatedAt, String publishedAt) {}

    Summary summary() {
        int count = 0;
        for (Tier tier : nonNull(tiers)) count += nonNull(tier.questions()).size();
        return new Summary(id, languageId, number, status, title, count, updatedAt, publishedAt);
    }

    /** Contrôle de structure à l'enregistrement : identifiants, tailles et valeurs connues (un brouillon peut être incomplet). */
    static void checkStructure(Content content) {
        if (content == null) throw HttpError.badRequest("Le test de niveau est requis.");
        if (text(content.title()).length() > 120 || text(content.description()).length() > 2000) {
            throw HttpError.badRequest("Le titre compte 120 caractères au plus, la présentation 2 000.");
        }
        List<Tier> tiers = nonNull(content.tiers());
        if (tiers.size() > LEVELS.size()) throw HttpError.badRequest("Un test de niveau compte six paliers au plus.");
        Set<String> codes = new HashSet<>();
        Set<String> questionIds = new HashSet<>();
        for (Tier tier : tiers) {
            if (tier == null || tier.code() == null || !LEVELS.contains(tier.code()) || !codes.add(tier.code())) {
                throw HttpError.badRequest("Chaque palier porte un niveau distinct parmi A1, A2, B1, B2, C1 et C2.");
            }
            if (text(tier.title()).length() > 120 || tier.passPercent() < 1 || tier.passPercent() > 100
                    || tier.minCompetencePercent() < 0 || tier.minCompetencePercent() > 100
                    || tier.drawCount() < 0 || tier.drawCount() > 60 || nonNull(tier.questions()).size() > 60) {
                throw HttpError.badRequest("Vérifiez le titre, les seuils et le nombre de questions du palier " + tier.code() + ".");
            }
            for (Question question : nonNull(tier.questions())) {
                requireId(question == null ? null : question.id(), "question");
                if (!questionIds.add(question.id())) {
                    throw HttpError.badRequest("Deux questions portent l’identifiant " + question.id() + ".");
                }
                if (!COMPETENCES.contains(question.competence()) || text(question.prompt()).length() > MAX_PROMPT
                        || question.moduleRef() != null && !question.moduleRef().isBlank()
                                && !question.moduleRef().matches(VersionDocument.ID)
                        || nonNull(question.options()).size() > 6 || nonNull(question.placements()).size() > 4) {
                    throw HttpError.badRequest("Vérifiez la compétence, l’énoncé et les choix de la question " + question.id() + ".");
                }
                Set<String> optionIds = new HashSet<>();
                for (Option option : nonNull(question.options())) {
                    requireId(option == null ? null : option.id(), "choix");
                    if (DONT_KNOW.equals(option.id()) || !optionIds.add(option.id()) || text(option.label()).length() > 300) {
                        throw HttpError.badRequest("Vérifiez les choix de la question " + question.id()
                                + " (identifiants distincts, « dontknow » réservé, 300 caractères au plus).");
                    }
                }
                for (Placement placement : nonNull(question.placements())) {
                    if (placement == null || placement.assetId() == null || !placement.assetId().matches("[a-z0-9-]{1,64}")
                            || placement.assetVersion() < 1 || placement.assetVersion() > 9999
                            || !USAGES.contains(placement.usage()) || !TRANSCRIPTS.contains(placement.transcriptVisibility())
                            || text(placement.alt()).length() > 300 || text(placement.caption()).length() > 300) {
                        throw HttpError.badRequest("Un support de la question " + question.id() + " est invalide.");
                    }
                }
            }
        }
    }

    /** Contenu enregistré : textes sans espaces superflus, légende et texte alternatif vides ramenés à null. */
    static Content normalized(Content content) {
        List<Tier> tiers = new ArrayList<>();
        for (Tier tier : nonNull(content.tiers())) {
            List<Question> questions = new ArrayList<>();
            for (Question question : nonNull(tier.questions())) {
                List<Option> options = new ArrayList<>();
                for (Option option : nonNull(question.options())) {
                    options.add(new Option(option.id(), text(option.label()), option.correct()));
                }
                List<Placement> placements = new ArrayList<>();
                for (Placement placement : nonNull(question.placements())) {
                    placements.add(new Placement(placement.assetId(), placement.assetVersion(), placement.usage(),
                            placement.decorative() ? null : blankToNull(placement.alt()), blankToNull(placement.caption()),
                            placement.transcriptVisibility(), placement.decorative()));
                }
                questions.add(new Question(question.id(), question.competence(), blankToNull(question.moduleRef()),
                        text(question.prompt()), List.copyOf(options), List.copyOf(placements)));
            }
            tiers.add(new Tier(tier.code(), text(tier.title()), tier.passPercent(), tier.minCompetencePercent(),
                    tier.drawCount(), List.copyOf(questions)));
        }
        return new Content(text(content.title()), text(content.description()), List.copyOf(tiers));
    }

    /** Complétude exigée à la publication : tout ce qui manque est listé avec son emplacement. */
    static Checks check(String title, List<Tier> tiers) {
        List<Issue> issues = new ArrayList<>();
        if (text(title).isBlank()) issues.add(new Issue("title", "Donnez un titre au test de niveau."));
        if (nonNull(tiers).isEmpty()) issues.add(new Issue("tiers", "Ajoutez au moins un palier, en commençant par A1."));
        for (int t = 0; t < nonNull(tiers).size(); t++) {
            Tier tier = tiers.get(t);
            String at = "tiers[" + t + "]";
            String code = tier.code();
            if (t == 0 && !"A1".equals(code)) {
                issues.add(new Issue(at + ".code", "Le test commence au palier A1 : un élève qui échoue au premier palier est débutant."));
            }
            if (t > 0 && LEVELS.indexOf(code) != LEVELS.indexOf(tiers.get(t - 1).code()) + 1) {
                issues.add(new Issue(at + ".code", "Les paliers se suivent sans trou (A1, A2, B1…) : le palier " + code
                        + " ne peut pas suivre le palier " + tiers.get(t - 1).code() + "."));
            }
            if (text(tier.title()).isBlank()) issues.add(new Issue(at + ".title", "Donnez un titre au palier " + code + "."));
            List<Question> questions = nonNull(tier.questions());
            if (tier.drawCount() < 1) {
                issues.add(new Issue(at + ".drawCount", "Indiquez combien de questions du palier " + code + " sont posées à l’élève."));
            } else if (tier.drawCount() > questions.size()) {
                issues.add(new Issue(at + ".drawCount", "Le palier " + code + " pose " + tier.drawCount()
                        + " questions mais sa banque n’en compte que " + questions.size() + "."));
            }
            if (tier.minCompetencePercent() > tier.passPercent()) {
                issues.add(new Issue(at + ".minCompetencePercent",
                        "Le seuil par compétence du palier " + code + " ne peut pas dépasser son seuil de réussite."));
            }
            for (int q = 0; q < questions.size(); q++) {
                Question question = questions.get(q);
                String questionAt = at + ".questions[" + q + "]";
                String name = "« " + (text(question.prompt()).isBlank() ? question.id() : excerpt(question.prompt())) + " »";
                if (text(question.prompt()).isBlank()) {
                    issues.add(new Issue(questionAt + ".prompt", "Rédigez l’énoncé de la question " + question.id() + "."));
                }
                List<Option> options = nonNull(question.options());
                if (options.size() < 2) issues.add(new Issue(questionAt + ".options", "Proposez au moins deux choix pour " + name + "."));
                if (options.stream().filter(Option::correct).count() != 1) {
                    issues.add(new Issue(questionAt + ".options", "Indiquez une seule bonne réponse pour " + name + "."));
                }
                if (options.stream().anyMatch(option -> text(option.label()).isBlank())) {
                    issues.add(new Issue(questionAt + ".options", "Chaque choix de " + name + " doit avoir un libellé."));
                }
                List<Placement> placements = nonNull(question.placements());
                long sounds = placements.stream().filter(placement -> "audio".equals(placement.usage())).count();
                if ("ecoute".equals(question.competence()) && sounds != 1) {
                    issues.add(new Issue(questionAt + ".placements", "Une question d’écoute a exactement un son : " + name + "."));
                }
                for (int p = 0; p < placements.size(); p++) {
                    Placement placement = placements.get(p);
                    if ("illustration".equals(placement.usage()) && !placement.decorative() && text(placement.alt()).isBlank()) {
                        issues.add(new Issue(questionAt + ".placements[" + p + "].alt", "Rédigez le texte alternatif de l’image "
                                + placement.assetId() + " ou marquez-la comme décorative."));
                    }
                }
            }
        }
        return new Checks(issues.isEmpty(), List.copyOf(issues));
    }

    /** Versions de médias à publier avec la banque : sons et images de toutes les questions. */
    List<MediaRef> mediaRefs() {
        Set<MediaRef> refs = new LinkedHashSet<>();
        for (Tier tier : nonNull(tiers)) {
            for (Question question : nonNull(tier.questions())) {
                nonNull(question.placements()).forEach(placement -> refs.add(new MediaRef(placement.assetId(), placement.assetVersion())));
            }
        }
        return List.copyOf(refs);
    }

    private static String excerpt(String prompt) {
        String line = text(prompt).lines().filter(value -> !value.isBlank()).reduce((first, last) -> last).orElse("").strip();
        return line.length() > 80 ? line.substring(0, 79).strip() + "…" : line;
    }

    private static void requireId(String id, String what) {
        if (id == null || !id.matches(VersionDocument.ID) || id.length() > 64) {
            throw HttpError.badRequest("Identifiant de " + what + " invalide : lettres minuscules, chiffres et tirets.");
        }
    }

    private static String blankToNull(String value) {
        String text = text(value);
        return text.isEmpty() ? null : text;
    }

    static String text(String value) {
        return VersionDocument.text(value);
    }

    static <T> List<T> nonNull(List<T> list) {
        return VersionDocument.nonNull(list);
    }
}
