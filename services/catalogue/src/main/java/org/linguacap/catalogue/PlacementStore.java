package org.linguacap.catalogue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.linguacap.catalogue.PlacementDocument.Content;
import org.linguacap.catalogue.PlacementDocument.Summary;
import org.linguacap.catalogue.PlacementDocument.Tier;
import org.linguacap.catalogue.VersionDocument.MediaRef;
import org.linguacap.common.HttpError;

/** Banques du test de niveau : un brouillon par langue à la fois, une banque publiée par langue, figée une fois publiée. */
@ApplicationScoped
class PlacementStore {
    private static final Logger LOG = Logger.getLogger(PlacementStore.class);
    private static final String COLUMNS = """
            id, language_id, number, status, title, description, tiers::text as tiers, updated_at, published_at
            """;

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    public record Published(Summary test, List<MediaRef> media) {}

    List<Summary> list() {
        return read("list placement tests", connection -> {
            List<Summary> tests = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select id, language_id, number, status, title, updated_at, published_at,
                           (select coalesce(sum(jsonb_array_length(coalesce(tier -> 'questions', '[]'::jsonb))), 0)
                            from jsonb_array_elements(tiers) tier) as question_count
                    from catalogue.placement_tests order by language_id, number desc
                    """); var rows = query.executeQuery()) {
                while (rows.next()) {
                    tests.add(new Summary(rows.getObject("id", UUID.class), rows.getString("language_id"), rows.getInt("number"),
                            rows.getString("status"), rows.getString("title"), rows.getInt("question_count"),
                            text(rows.getObject("updated_at", OffsetDateTime.class)),
                            text(rows.getObject("published_at", OffsetDateTime.class))));
                }
            }
            return tests;
        });
    }

    /** Nouveau brouillon de la langue : vide, ou copie d'une banque existante de la même langue. */
    UUID create(String languageId, UUID fromTestId, UUID createdBy) {
        PlacementDocument source = fromTestId == null ? null : document(fromTestId);
        if (source != null && !source.languageId().equals(languageId)) {
            throw HttpError.badRequest("La banque copiée appartient à une autre langue.");
        }
        return transaction("create placement test", connection -> {
            lockLanguage(connection, languageId);
            try (var query = connection.prepareStatement("select 1 from catalogue.languages where id = ?")) {
                query.setString(1, languageId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Langue inconnue du catalogue.");
                }
            }
            try (var query = connection.prepareStatement(
                    "select 1 from catalogue.placement_tests where language_id = ? and status = 'draft'")) {
                query.setString(1, languageId);
                try (var rows = query.executeQuery()) {
                    if (rows.next()) throw HttpError.conflict("Un brouillon du test de niveau existe déjà pour cette langue : reprenez-le.");
                }
            }
            try (var insert = connection.prepareStatement("""
                    insert into catalogue.placement_tests (language_id, number, title, description, tiers, created_by)
                    select ?, coalesce(max(number), 0) + 1, ?, ?, ?::jsonb, ? from catalogue.placement_tests where language_id = ?
                    returning id
                    """)) {
                insert.setString(1, languageId);
                insert.setString(2, source == null ? "" : source.title());
                insert.setString(3, source == null ? "" : source.description());
                insert.setString(4, write(source == null ? List.of() : source.tiers()));
                insert.setObject(5, createdBy);
                insert.setString(6, languageId);
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    return rows.getObject(1, UUID.class);
                }
            }
        });
    }

    PlacementDocument document(UUID testId) {
        return read("read placement test", connection -> {
            try (var query = connection.prepareStatement("select " + COLUMNS + " from catalogue.placement_tests where id = ?")) {
                query.setObject(1, testId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Test de niveau introuvable.");
                    return document(rows);
                }
            }
        });
    }

    /** Banque publiée d'une langue, corrigés compris. */
    PlacementDocument published(String languageId) {
        return read("read published placement test", connection -> {
            try (var query = connection.prepareStatement(
                    "select " + COLUMNS + " from catalogue.placement_tests where language_id = ? and status = 'published'")) {
                query.setString(1, languageId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Aucun test de niveau publié pour cette langue.");
                    return document(rows);
                }
            }
        });
    }

    /** Remplace le contenu d'un brouillon (déjà contrôlé et normalisé). */
    void save(UUID testId, Content content) {
        transaction("save placement test", connection -> {
            try (var lock = connection.prepareStatement("select status from catalogue.placement_tests where id = ? for update")) {
                lock.setObject(1, testId);
                try (var rows = lock.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Test de niveau introuvable.");
                    if (!"draft".equals(rows.getString("status"))) {
                        throw HttpError.conflict("Ce test de niveau est publié : créez un nouveau brouillon pour le modifier.");
                    }
                }
            }
            try (var update = connection.prepareStatement("""
                    update catalogue.placement_tests set title = ?, description = ?, tiers = ?::jsonb, updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, content.title());
                update.setString(2, content.description());
                update.setString(3, write(content.tiers()));
                update.setObject(4, testId);
                update.executeUpdate();
            }
            return null;
        });
    }

    /**
     * Publie un brouillon : la banque publiée précédente de la langue est retirée (les tentatives en cours gardent le
     * tirage figé à leur démarrage). Les versions de médias référencées ont été publiées au préalable par Médias.
     */
    Published publish(UUID testId, List<MediaRef> media) {
        return transaction("publish placement test", connection -> {
            String languageId;
            try (var query = connection.prepareStatement("select language_id from catalogue.placement_tests where id = ?")) {
                query.setObject(1, testId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Test de niveau introuvable.");
                    languageId = rows.getString(1);
                }
            }
            lockLanguage(connection, languageId);
            try (var lock = connection.prepareStatement("select status from catalogue.placement_tests where id = ? for update")) {
                lock.setObject(1, testId);
                try (var rows = lock.executeQuery()) {
                    rows.next();
                    if (!"draft".equals(rows.getString("status"))) throw HttpError.conflict("Seul un brouillon se publie.");
                }
            }
            try (var retire = connection.prepareStatement("""
                    update catalogue.placement_tests set status = 'retired', retired_at = now()
                    where language_id = ? and status = 'published'
                    """)) {
                retire.setString(1, languageId);
                retire.executeUpdate();
            }
            try (var publish = connection.prepareStatement("""
                    update catalogue.placement_tests set status = 'published', published_at = now(), updated_at = now()
                    where id = ?
                    """)) {
                publish.setObject(1, testId);
                publish.executeUpdate();
            }
            try (var query = connection.prepareStatement("select " + COLUMNS + " from catalogue.placement_tests where id = ?")) {
                query.setObject(1, testId);
                try (var rows = query.executeQuery()) {
                    rows.next();
                    return new Published(document(rows).summary(), media);
                }
            }
        });
    }

    /** Sérialise les créations et publications d'une même langue (verrou de transaction, sans droit d'écriture sur languages). */
    private static void lockLanguage(Connection connection, String languageId) throws SQLException {
        try (var lock = connection.prepareStatement("select pg_advisory_xact_lock(hashtext('catalogue.placement_tests:' || ?))")) {
            lock.setString(1, languageId);
            lock.executeQuery().close();
        }
    }

    private PlacementDocument document(ResultSet rows) throws SQLException {
        return new PlacementDocument(rows.getObject("id", UUID.class), rows.getString("language_id"), rows.getInt("number"),
                rows.getString("status"), rows.getString("title"), rows.getString("description"), tiers(rows.getString("tiers")),
                text(rows.getObject("updated_at", OffsetDateTime.class)), text(rows.getObject("published_at", OffsetDateTime.class)));
    }

    private List<Tier> tiers(String value) throws SQLException {
        try {
            return json.readValue(value, new TypeReference<List<Tier>>() {});
        } catch (JsonProcessingException error) {
            throw new SQLException("Paliers du test de niveau illisibles", "XX000", error);
        }
    }

    private String write(List<Tier> tiers) throws SQLException {
        try {
            return json.writeValueAsString(tiers);
        } catch (JsonProcessingException error) {
            throw new SQLException("Paliers du test de niveau non sérialisables", "XX000", error);
        }
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
        LOG.errorf("Catalogue database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        if ("P0001".equals(error.getSQLState())) {
            return HttpError.conflict("Ce test de niveau est publié : créez un nouveau brouillon pour le modifier.");
        }
        if ("23505".equals(error.getSQLState())) {
            return HttpError.conflict("Ce test de niveau vient d’être modifié par ailleurs : rechargez-le.");
        }
        return HttpError.unavailable("Le catalogue est temporairement indisponible.");
    }
}
