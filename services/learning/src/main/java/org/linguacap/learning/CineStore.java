package org.linguacap.learning;

import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.learning.CineRules.FilmRecommendation;
import org.linguacap.learning.CineRules.LearnerWord;
import org.linguacap.learning.CineRules.WordInput;

/** Carnet de mots et séquences proposées (Ciné-club, EVO-055), dans les tables d'Apprentissage. */
@ApplicationScoped
class CineStore {
    private static final Logger LOG = Logger.getLogger(CineStore.class);
    private static final String WORD_COLUMNS = "id, learner_id, language_id, word, note, source_kind, source_id, created_at, updated_at";
    private static final String RECOMMENDATION_COLUMNS = "id, learner_id, film_id, sequence_id, recommended_by, "
            + "recommended_by_role, note, created_at, dismissed_at";
    private static final String UNIQUE_VIOLATION = "23505";

    @Inject AgroalDataSource dataSource;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    /** Mots du carnet, du plus récent au plus ancien. */
    List<LearnerWord> words(UUID learnerId) {
        return read("list words", connection -> {
            try (var query = connection.prepareStatement("select " + WORD_COLUMNS
                    + " from learning.learner_words where learner_id = ? order by created_at desc, id")) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    List<LearnerWord> words = new ArrayList<>();
                    while (rows.next()) words.add(word(rows));
                    return List.copyOf(words);
                }
            }
        });
    }

    /**
     * Note un mot : 3 000 mots au plus par élève (verrou consultatif par élève, pour que deux ajouts simultanés ne
     * dépassent pas la limite) ; un même mot (casse ignorée) n'est noté qu'une fois par source.
     */
    LearnerWord add(UUID learnerId, String languageId, WordInput input) {
        return transaction("add word", connection -> {
            lock(connection, learnerId);
            try (var count = connection.prepareStatement("select count(*) from learning.learner_words where learner_id = ?")) {
                count.setObject(1, learnerId);
                try (var rows = count.executeQuery()) {
                    rows.next();
                    if (rows.getInt(1) >= CineRules.MAX_WORDS) {
                        throw HttpError.conflict("Ton carnet compte déjà 3 000 mots : supprime ceux que tu connais"
                                + " avant d’en noter d’autres.");
                    }
                }
            }
            try (var insert = connection.prepareStatement("insert into learning.learner_words"
                    + " (learner_id, language_id, word, note, source_kind, source_id) values (?, ?, ?, ?, ?, ?) returning "
                    + WORD_COLUMNS)) {
                insert.setObject(1, learnerId);
                insert.setString(2, languageId);
                insert.setString(3, input.word());
                insert.setString(4, input.note());
                insert.setString(5, input.sourceKind());
                insert.setString(6, input.sourceId());
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    return word(rows);
                }
            }
        });
    }

    /** Modifie le mot ou la note d'un mot de l'élève (404 s'il n'est pas à lui). */
    LearnerWord update(UUID learnerId, UUID wordId, WordInput change) {
        return transaction("update word", connection -> {
            try (var update = connection.prepareStatement("update learning.learner_words"
                    + " set word = coalesce(?, word), note = coalesce(?, note), updated_at = now()"
                    + " where id = ? and learner_id = ? returning " + WORD_COLUMNS)) {
                update.setString(1, change.word());
                update.setString(2, change.note());
                update.setObject(3, wordId);
                update.setObject(4, learnerId);
                try (var rows = update.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Mot introuvable dans ton carnet.");
                    return word(rows);
                }
            }
        });
    }

    /** Supprime un mot de l'élève (404 s'il n'est pas à lui). */
    void delete(UUID learnerId, UUID wordId) {
        transaction("delete word", connection -> {
            try (var delete = connection.prepareStatement(
                    "delete from learning.learner_words where id = ? and learner_id = ?")) {
                delete.setObject(1, wordId);
                delete.setObject(2, learnerId);
                if (delete.executeUpdate() == 0) throw HttpError.notFound("Mot introuvable dans ton carnet.");
            }
            return null;
        });
    }

    /** Propositions de l'élève, de la plus récente à la plus ancienne (écartées comprises), 200 au plus. */
    List<FilmRecommendation> recommendations(UUID learnerId) {
        return read("list film recommendations", connection -> {
            try (var query = connection.prepareStatement("select " + RECOMMENDATION_COLUMNS
                    + " from learning.film_recommendations where learner_id = ? order by created_at desc, id limit 200")) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    List<FilmRecommendation> recommendations = new ArrayList<>();
                    while (rows.next()) recommendations.add(recommendation(rows));
                    return List.copyOf(recommendations);
                }
            }
        });
    }

    /** Propose une séquence ; une seule proposition en cours par séquence, 100 en cours au plus par élève. */
    FilmRecommendation recommend(UUID learnerId, String filmId, String sequenceId, UUID recommendedBy, String role,
                                 String note) {
        return transaction("recommend film sequence", connection -> {
            lock(connection, learnerId);
            try (var count = connection.prepareStatement(
                    "select count(*) from learning.film_recommendations where learner_id = ? and dismissed_at is null")) {
                count.setObject(1, learnerId);
                try (var rows = count.executeQuery()) {
                    rows.next();
                    if (rows.getInt(1) >= CineRules.MAX_OPEN_RECOMMENDATIONS) {
                        throw HttpError.conflict("Cet élève a déjà " + CineRules.MAX_OPEN_RECOMMENDATIONS
                                + " séquences proposées en cours.");
                    }
                }
            }
            try (var insert = connection.prepareStatement("insert into learning.film_recommendations"
                    + " (learner_id, film_id, sequence_id, recommended_by, recommended_by_role, note)"
                    + " values (?, ?, ?, ?, ?, ?) returning " + RECOMMENDATION_COLUMNS)) {
                insert.setObject(1, learnerId);
                insert.setString(2, filmId);
                insert.setString(3, sequenceId);
                insert.setObject(4, recommendedBy);
                insert.setString(5, role);
                insert.setString(6, note);
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    return recommendation(rows);
                }
            }
        });
    }

    /** L'élève écarte une proposition (sans effet si elle l'est déjà) ; 404 si elle ne lui est pas adressée. */
    FilmRecommendation dismiss(UUID learnerId, UUID recommendationId) {
        return transaction("dismiss film recommendation", connection -> {
            try (var update = connection.prepareStatement("update learning.film_recommendations"
                    + " set dismissed_at = coalesce(dismissed_at, now()) where id = ? and learner_id = ? returning "
                    + RECOMMENDATION_COLUMNS)) {
                update.setObject(1, recommendationId);
                update.setObject(2, learnerId);
                try (var rows = update.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Proposition introuvable.");
                    return recommendation(rows);
                }
            }
        });
    }

    /** Langue du parcours le plus récent de l'élève (en cours d'abord), ou null. */
    String pathLanguage(UUID learnerId) {
        return read("read path language", connection -> {
            try (var query = connection.prepareStatement("""
                    select language_id from learning.paths where learner_id = ?
                    order by (status in ('draft', 'active')) desc, created_at desc limit 1
                    """)) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    return rows.next() ? rows.getString(1) : null;
                }
            }
        });
    }

    private static void lock(Connection connection, UUID learnerId) throws SQLException {
        try (var lock = connection.prepareStatement("select pg_advisory_xact_lock(hashtextextended(?, 55))")) {
            lock.setString(1, learnerId.toString());
            lock.execute();
        }
    }

    private static LearnerWord word(ResultSet rows) throws SQLException {
        return new LearnerWord(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                rows.getString("language_id"), rows.getString("word"), rows.getString("note"),
                rows.getString("source_kind"), rows.getString("source_id"),
                text(rows.getObject("created_at", OffsetDateTime.class)), text(rows.getObject("updated_at", OffsetDateTime.class)));
    }

    private static FilmRecommendation recommendation(ResultSet rows) throws SQLException {
        return new FilmRecommendation(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                rows.getString("film_id"), rows.getString("sequence_id"), rows.getObject("recommended_by", UUID.class),
                rows.getString("recommended_by_role"), rows.getString("note"),
                text(rows.getObject("created_at", OffsetDateTime.class)), text(rows.getObject("dismissed_at", OffsetDateTime.class)));
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    private <T> T read(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            return work.run(connection);
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private <T> T transaction(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                T result = work.run(connection);
                connection.commit();
                return result;
            } catch (SQLException | RuntimeException error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private static RuntimeException failure(String operation, SQLException error) {
        if (UNIQUE_VIOLATION.equals(error.getSQLState())) {
            return operation.contains("recommend")
                    ? HttpError.conflict("Cette séquence est déjà proposée à l’élève.")
                    : HttpError.conflict("Ce mot est déjà dans ton carnet pour cette source.");
        }
        LOG.errorf("Learning cine operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Le Ciné-club est temporairement indisponible.");
    }
}
