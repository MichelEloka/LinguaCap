package org.linguacap.identity;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Array;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import org.linguacap.common.HttpError;
import org.linguacap.identity.AdminUserResource.AdminUser;
import org.linguacap.identity.AdminUserResource.AdminUserDetail;
import org.linguacap.identity.AdminUserResource.Assignment;
import org.linguacap.identity.IdentityResource.Profile;

/** Comptes, rattachements, correcteurs et permissions du schéma identity. */
@ApplicationScoped
class IdentityStore {
    private static final String ACCOUNT = """
            select p.id, p.display_name, p.role, p.teacher_id, p.status, p.last_seen_at,
                   coalesce(array_agg(pe.permission order by pe.permission)
                            filter (where pe.permission is not null), '{}') as permissions
            from identity.profiles p
            left join identity.permissions pe on pe.profile_id = p.id
            where p.id = ?
            group by p.id
            """;

    private static final String ADMIN_USERS = """
            select p.id, p.display_name, p.role, p.status, p.teacher_id, t.display_name as teacher_name,
                   r.reviewer_id, rp.display_name as reviewer_name, p.created_at, p.last_seen_at, p.disabled_at,
                   i.email, i.created_at as invited_at, i.accepted_at as activated_at,
                   coalesce(array_agg(pe.permission order by pe.permission)
                            filter (where pe.permission is not null), '{}') as permissions
            from identity.profiles p
            left join identity.profiles t on t.id = p.teacher_id
            left join identity.reviewer_assignments r on r.learner_id = p.id and r.ended_at is null
            left join identity.profiles rp on rp.id = r.reviewer_id
            left join identity.invitations i on i.invited_user_id = p.id and i.accepted_at is not null
            left join identity.permissions pe on pe.profile_id = p.id
            %s
            group by p.id, t.display_name, r.reviewer_id, rp.display_name, i.email, i.created_at, i.accepted_at
            order by p.display_name, p.id
            """;

    @Inject Database db;

    Account findAccount(UUID id) {
        return db.read("read account", connection -> findAccount(connection, id));
    }

    /** Met à jour la dernière activité au plus toutes les cinq minutes. */
    void touch(UUID id) {
        db.read("record activity", connection -> {
            try (PreparedStatement statement = connection.prepareStatement("""
                    update identity.profiles set last_seen_at = now()
                    where id = ? and (last_seen_at is null or last_seen_at < now() - interval '5 minutes')
                    """)) {
                statement.setObject(1, id);
                return statement.executeUpdate();
            }
        });
    }

    /** Crée le profil prévu par une invitation valide lors de la première connexion vérifiée. */
    Account activate(UUID id, String verifiedEmail, String requestId) {
        return db.transaction("activate invitation", connection -> {
            UUID invitationId;
            String displayName;
            String role;
            UUID teacherId;
            UUID invitedBy;
            try (PreparedStatement statement = connection.prepareStatement("""
                    select id, display_name, role, teacher_id, invited_by
                    from identity.invitations
                    where email = ? and accepted_at is null and cancelled_at is null and expires_at > now()
                        and (invited_user_id is null or invited_user_id = ?)
                    for update
                    """)) {
                statement.setString(1, verifiedEmail);
                statement.setObject(2, id);
                try (ResultSet rows = statement.executeQuery()) {
                    if (!rows.next()) return findAccount(connection, id);
                    invitationId = rows.getObject("id", UUID.class);
                    displayName = rows.getString("display_name");
                    role = rows.getString("role");
                    teacherId = rows.getObject("teacher_id", UUID.class);
                    invitedBy = rows.getObject("invited_by", UUID.class);
                }
            }
            db.setActor(connection, invitedBy);
            try (PreparedStatement insert = connection.prepareStatement("""
                    insert into identity.profiles (id, display_name, role, teacher_id) values (?, ?, ?, ?)
                    on conflict (id) do nothing
                    """)) {
                insert.setObject(1, id);
                insert.setString(2, displayName);
                insert.setString(3, role);
                insert.setObject(4, teacherId);
                insert.executeUpdate();
            }
            try (PreparedStatement accept = connection.prepareStatement("""
                    update identity.invitations set invited_user_id = ?, accepted_at = now() where id = ?
                    """)) {
                accept.setObject(1, id);
                accept.setObject(2, invitationId);
                accept.executeUpdate();
            }
            Map<String, Object> data = new HashMap<>();
            data.put("invitationId", invitationId.toString());
            data.put("role", role);
            data.put("teacherId", teacherId == null ? null : teacherId.toString());
            db.record(connection, "identity.account_activated", "account", id,
                    "learner".equals(role) ? id : null, requestId, data);
            return findAccount(connection, id);
        });
    }

    List<Profile> learners(UUID teacherId) {
        String sql = """
                select id, display_name, role, teacher_id
                from identity.profiles
                where role = 'learner'
                """ + (teacherId == null ? "" : " and teacher_id = ?") + " order by display_name, id";
        return db.read("list learners", connection -> {
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                if (teacherId != null) statement.setObject(1, teacherId);
                try (ResultSet rows = statement.executeQuery()) {
                    List<Profile> learners = new ArrayList<>();
                    while (rows.next()) {
                        learners.add(new Profile(rows.getObject("id", UUID.class), rows.getString("display_name"),
                                rows.getString("role"), rows.getObject("teacher_id", UUID.class)));
                    }
                    return learners;
                }
            }
        });
    }

    List<AdminUser> users() {
        return db.read("list users", connection -> {
            try (PreparedStatement statement = connection.prepareStatement(ADMIN_USERS.formatted(""));
                    ResultSet rows = statement.executeQuery()) {
                List<AdminUser> users = new ArrayList<>();
                while (rows.next()) users.add(adminUser(rows));
                return users;
            }
        });
    }

    AdminUserDetail user(UUID id) {
        return db.read("read user", connection -> {
            AdminUser user;
            try (PreparedStatement statement = connection.prepareStatement(ADMIN_USERS.formatted("where p.id = ?"))) {
                statement.setObject(1, id);
                try (ResultSet rows = statement.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Compte introuvable.");
                    user = adminUser(rows);
                }
            }
            return new AdminUserDetail(user,
                    history(connection, "teacher_assignments", "teacher_id", id),
                    history(connection, "reviewer_assignments", "reviewer_id", id));
        });
    }

    void updateStatus(UUID callerId, UUID targetId, String status, String requestId) {
        db.transaction("update account status", connection -> {
            Account target = lock(connection, targetId);
            AccountRules.checkStatusChange(callerId, target, status, otherActiveAdmins(connection, target));
            if (status.equals(target.status())) return null;
            try (PreparedStatement update = connection.prepareStatement("""
                    update identity.profiles
                    set status = ?, disabled_at = case when ? = 'disabled' then now() else null end
                    where id = ?
                    """)) {
                update.setString(1, status);
                update.setString(2, status);
                update.setObject(3, targetId);
                update.executeUpdate();
            }
            db.record(connection, "disabled".equals(status) ? "identity.account_disabled" : "identity.account_enabled",
                    "account", targetId, target.is("learner") ? targetId : null, requestId,
                    Map.of("by", callerId.toString()));
            return null;
        });
    }

    void updateRole(UUID callerId, UUID targetId, String role, String requestId) {
        db.transaction("update account role", connection -> {
            Account target = lock(connection, targetId);
            AccountRules.checkRoleChange(callerId, target, role, otherActiveAdmins(connection, target),
                    learnersOf(connection, targetId));
            if (role.equals(target.role())) return null;
            try (PreparedStatement update = connection.prepareStatement(
                    "update identity.profiles set role = ? where id = ?")) {
                update.setString(1, role);
                update.setObject(2, targetId);
                update.executeUpdate();
            }
            db.record(connection, "identity.role_changed", "account", targetId, null, requestId,
                    Map.of("from", target.role(), "to", role, "by", callerId.toString()));
            return null;
        });
    }

    void replacePermissions(UUID callerId, UUID targetId, List<String> requested, String requestId) {
        db.transaction("update permissions", connection -> {
            Account target = lock(connection, targetId);
            Set<String> wanted = AccountRules.checkPermissions(target, requested);
            if (wanted.equals(target.permissions())) return null;
            for (String permission : target.permissions()) {
                if (wanted.contains(permission)) continue;
                try (PreparedStatement delete = connection.prepareStatement(
                        "delete from identity.permissions where profile_id = ? and permission = ?")) {
                    delete.setObject(1, targetId);
                    delete.setString(2, permission);
                    delete.executeUpdate();
                }
            }
            for (String permission : wanted) {
                if (target.permissions().contains(permission)) continue;
                try (PreparedStatement insert = connection.prepareStatement("""
                        insert into identity.permissions (profile_id, permission, granted_by) values (?, ?, ?)
                        """)) {
                    insert.setObject(1, targetId);
                    insert.setString(2, permission);
                    insert.setObject(3, callerId);
                    insert.executeUpdate();
                }
            }
            if (target.has("correction") && !wanted.contains("correction")) {
                // Sans la permission Correction, les désignations de correcteur prennent fin immédiatement.
                try (PreparedStatement end = connection.prepareStatement("""
                        update identity.reviewer_assignments set ended_at = now()
                        where reviewer_id = ? and ended_at is null
                        """)) {
                    end.setObject(1, targetId);
                    end.executeUpdate();
                }
            }
            db.record(connection, "identity.permissions_changed", "account", targetId, null, requestId,
                    Map.of("permissions", List.copyOf(wanted), "by", callerId.toString()));
            return null;
        });
    }

    void assignTeacher(UUID callerId, UUID learnerId, UUID teacherId, String requestId) {
        db.transaction("assign teacher", connection -> {
            Account learner = lockOrNull(connection, learnerId);
            Account teacher = teacherId == null ? null : findAccount(connection, teacherId);
            if (teacherId != null && teacher == null) {
                throw HttpError.badRequest("Le professeur sélectionné est introuvable ou désactivé.");
            }
            AccountRules.checkTeacherAssignment(learner, teacher);
            if (Objects.equals(learner.teacherId(), teacherId)) return null;
            db.setActor(connection, callerId);
            try (PreparedStatement update = connection.prepareStatement(
                    "update identity.profiles set teacher_id = ? where id = ?")) {
                update.setObject(1, teacherId);
                update.setObject(2, learnerId);
                update.executeUpdate();
            }
            if (teacherId != null) endReviewer(connection, learnerId);
            Map<String, Object> data = new HashMap<>();
            data.put("teacherId", teacherId == null ? null : teacherId.toString());
            data.put("previousTeacherId", learner.teacherId() == null ? null : learner.teacherId().toString());
            data.put("by", callerId.toString());
            db.record(connection, "identity.teacher_assigned", "account", learnerId, learnerId, requestId, data);
            return null;
        });
    }

    void assignReviewer(UUID callerId, UUID learnerId, UUID reviewerId, String requestId) {
        db.transaction("assign reviewer", connection -> {
            Account learner = lockOrNull(connection, learnerId);
            Account reviewer = reviewerId == null ? null : findAccount(connection, reviewerId);
            if (reviewerId != null && reviewer == null) {
                throw HttpError.badRequest("Le correcteur sélectionné est introuvable.");
            }
            AccountRules.checkReviewerAssignment(learner, reviewer);
            UUID current = activeReviewer(connection, learnerId);
            if (Objects.equals(current, reviewerId)) return null;
            endReviewer(connection, learnerId);
            if (reviewerId != null) {
                try (PreparedStatement insert = connection.prepareStatement("""
                        insert into identity.reviewer_assignments (learner_id, reviewer_id, assigned_by) values (?, ?, ?)
                        """)) {
                    insert.setObject(1, learnerId);
                    insert.setObject(2, reviewerId);
                    insert.setObject(3, callerId);
                    insert.executeUpdate();
                }
            }
            Map<String, Object> data = new HashMap<>();
            data.put("reviewerId", reviewerId == null ? null : reviewerId.toString());
            data.put("previousReviewerId", current == null ? null : current.toString());
            data.put("by", callerId.toString());
            db.record(connection, "identity.reviewer_assigned", "account", learnerId, learnerId, requestId, data);
            return null;
        });
    }

    Account findAccount(Connection connection, UUID id) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(ACCOUNT)) {
            statement.setObject(1, id);
            try (ResultSet rows = statement.executeQuery()) {
                if (!rows.next()) return null;
                return new Account(rows.getObject("id", UUID.class), rows.getString("display_name"),
                        rows.getString("role"), rows.getObject("teacher_id", UUID.class), rows.getString("status"),
                        rows.getObject("last_seen_at", OffsetDateTime.class), Set.copyOf(texts(rows.getArray("permissions"))));
            }
        }
    }

    private Account lockOrNull(Connection connection, UUID id) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "select id from identity.profiles where id = ? for update")) {
            statement.setObject(1, id);
            try (ResultSet rows = statement.executeQuery()) {
                if (!rows.next()) return null;
            }
        }
        return findAccount(connection, id);
    }

    private Account lock(Connection connection, UUID id) throws SQLException {
        Account account = lockOrNull(connection, id);
        if (account == null) throw HttpError.notFound("Compte introuvable.");
        return account;
    }

    /** Verrouille les administrateurs pour qu'au moins l'un d'eux reste actif malgré des modifications simultanées. */
    private long otherActiveAdmins(Connection connection, Account target) throws SQLException {
        if (!target.is("admin")) return 0;
        try (PreparedStatement lock = connection.prepareStatement(
                "select id from identity.profiles where role = 'admin' order by id for update")) {
            lock.executeQuery().close();
        }
        try (PreparedStatement count = connection.prepareStatement("""
                select count(*) from identity.profiles where role = 'admin' and status = 'active' and id <> ?
                """)) {
            count.setObject(1, target.id());
            try (ResultSet rows = count.executeQuery()) {
                rows.next();
                return rows.getLong(1);
            }
        }
    }

    private int learnersOf(Connection connection, UUID teacherId) throws SQLException {
        try (PreparedStatement count = connection.prepareStatement(
                "select count(*) from identity.profiles where teacher_id = ?")) {
            count.setObject(1, teacherId);
            try (ResultSet rows = count.executeQuery()) {
                rows.next();
                return rows.getInt(1);
            }
        }
    }

    private UUID activeReviewer(Connection connection, UUID learnerId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("""
                select reviewer_id from identity.reviewer_assignments where learner_id = ? and ended_at is null
                """)) {
            statement.setObject(1, learnerId);
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() ? rows.getObject(1, UUID.class) : null;
            }
        }
    }

    private void endReviewer(Connection connection, UUID learnerId) throws SQLException {
        try (PreparedStatement end = connection.prepareStatement("""
                update identity.reviewer_assignments set ended_at = now() where learner_id = ? and ended_at is null
                """)) {
            end.setObject(1, learnerId);
            end.executeUpdate();
        }
    }

    private List<Assignment> history(Connection connection, String table, String personColumn, UUID learnerId)
            throws SQLException {
        String sql = """
                select a.%1$s as person_id, person.display_name as person_name, a.assigned_by,
                       author.display_name as assigned_by_name, a.started_at, a.ended_at
                from identity.%2$s a
                join identity.profiles person on person.id = a.%1$s
                left join identity.profiles author on author.id = a.assigned_by
                where a.learner_id = ?
                order by a.started_at desc, a.id
                """.formatted(personColumn, table);
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            try (ResultSet rows = statement.executeQuery()) {
                List<Assignment> history = new ArrayList<>();
                while (rows.next()) {
                    history.add(new Assignment(rows.getObject("person_id", UUID.class), rows.getString("person_name"),
                            rows.getObject("assigned_by", UUID.class), rows.getString("assigned_by_name"),
                            text(rows.getObject("started_at", OffsetDateTime.class)),
                            text(rows.getObject("ended_at", OffsetDateTime.class))));
                }
                return history;
            }
        }
    }

    private static AdminUser adminUser(ResultSet rows) throws SQLException {
        return new AdminUser(rows.getObject("id", UUID.class), rows.getString("display_name"), rows.getString("email"),
                rows.getString("role"), rows.getString("status"), texts(rows.getArray("permissions")),
                rows.getObject("teacher_id", UUID.class), rows.getString("teacher_name"),
                rows.getObject("reviewer_id", UUID.class), rows.getString("reviewer_name"),
                text(rows.getObject("invited_at", OffsetDateTime.class)),
                text(rows.getObject("activated_at", OffsetDateTime.class)),
                text(rows.getObject("last_seen_at", OffsetDateTime.class)),
                text(rows.getObject("created_at", OffsetDateTime.class)),
                text(rows.getObject("disabled_at", OffsetDateTime.class)));
    }

    private static List<String> texts(Array array) throws SQLException {
        if (array == null) return List.of();
        try {
            Set<String> values = new LinkedHashSet<>();
            for (Object value : (Object[]) array.getArray()) values.add(String.valueOf(value));
            return List.copyOf(values);
        } finally {
            array.free();
        }
    }

    static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }
}
