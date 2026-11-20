package org.linguacap.identity;

import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.identity.IdentityResource.Profile;

@ApplicationScoped
class IdentityStore {
    private static final Logger LOG = Logger.getLogger(IdentityStore.class);

    @Inject AgroalDataSource dataSource;

    Profile findProfile(UUID id) {
        try (Connection connection = dataSource.getConnection()) {
            return findProfile(connection, id);
        } catch (SQLException error) {
            throw databaseFailure("read profile", error);
        }
    }

    List<Profile> learners(UUID teacherId) {
        String sql = """
                select id, display_name, role, teacher_id
                from identity.profiles
                where role = 'learner'
                """ + (teacherId == null ? "" : " and teacher_id = ?") + " order by display_name, id";
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            if (teacherId != null) {
                statement.setObject(1, teacherId);
            }
            try (ResultSet rows = statement.executeQuery()) {
                List<Profile> learners = new ArrayList<>();
                while (rows.next()) {
                    learners.add(profile(rows));
                }
                return learners;
            }
        } catch (SQLException error) {
            throw databaseFailure("list learners", error);
        }
    }

    Invitation reserveInvitation(String email, String displayName, String role, UUID teacherId, UUID caller) {
        String insert = """
                insert into identity.invitations (id, email, display_name, role, teacher_id, invited_by)
                values (?, ?, ?, ?, ?, ?)
                on conflict (email) do nothing
                """;
        String select = """
                select id, email, display_name, role, teacher_id, accepted_at
                from identity.invitations
                where email = ?
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement create = connection.prepareStatement(insert);
                PreparedStatement read = connection.prepareStatement(select)) {
            create.setObject(1, UUID.randomUUID());
            create.setString(2, email);
            create.setString(3, displayName);
            create.setString(4, role);
            create.setObject(5, teacherId);
            create.setObject(6, caller);
            create.executeUpdate();

            read.setString(1, email);
            try (ResultSet rows = read.executeQuery()) {
                if (rows.next()) {
                    return invitation(rows);
                }
            }
            throw HttpError.unavailable("L’invitation est temporairement indisponible.");
        } catch (SQLException error) {
            throw databaseFailure("reserve invitation", error);
        }
    }

    Invitation markSent(UUID invitationId, UUID userId) {
        String sql = """
                update identity.invitations
                set invited_user_id = ?, sent_at = now()
                where id = ? and (invited_user_id is null or invited_user_id = ?)
                returning id, email, display_name, role, teacher_id, accepted_at
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, userId);
            statement.setObject(2, invitationId);
            statement.setObject(3, userId);
            try (ResultSet rows = statement.executeQuery()) {
                if (rows.next()) {
                    return invitation(rows);
                }
            }
            throw HttpError.conflict("L’invitation est déjà liée à un autre compte.");
        } catch (SQLException error) {
            throw databaseFailure("record invitation delivery", error);
        }
    }

    Profile activateInvitation(UUID id, String verifiedEmail) {
        // Row locking and the profile primary key make repeated activation requests safe.
        String sql = """
                with invitation as (
                    select id, display_name, role, teacher_id
                    from identity.invitations
                    where email = ? and accepted_at is null
                        and (invited_user_id is null or invited_user_id = ?)
                    for update
                ), created_profile as (
                    insert into identity.profiles (id, display_name, role, teacher_id)
                    select ?, display_name, role, teacher_id from invitation
                    on conflict (id) do nothing
                    returning id
                )
                update identity.invitations
                set invited_user_id = created_profile.id, accepted_at = now()
                from invitation, created_profile
                where identity.invitations.id = invitation.id
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, verifiedEmail);
            statement.setObject(2, id);
            statement.setObject(3, id);
            statement.executeUpdate();
            return findProfile(connection, id);
        } catch (SQLException error) {
            throw databaseFailure("activate invitation", error);
        }
    }

    private Profile findProfile(Connection connection, UUID id) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("""
                select id, display_name, role, teacher_id from identity.profiles where id = ?
                """)) {
            statement.setObject(1, id);
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() ? profile(rows) : null;
            }
        }
    }

    private Profile profile(ResultSet row) throws SQLException {
        return new Profile(row.getObject("id", UUID.class), row.getString("display_name"),
                row.getString("role"), row.getObject("teacher_id", UUID.class));
    }

    private Invitation invitation(ResultSet row) throws SQLException {
        return new Invitation(row.getObject("id", UUID.class), row.getString("email"),
                row.getString("display_name"), row.getString("role"), row.getObject("teacher_id", UUID.class),
                row.getObject("accepted_at") != null);
    }

    private RuntimeException databaseFailure(String operation, SQLException error) {
        LOG.errorf("Identity database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Le service d’identité est temporairement indisponible.");
    }

    record Invitation(UUID id, String email, String displayName, String role, UUID teacherId, boolean accepted) {}
}
