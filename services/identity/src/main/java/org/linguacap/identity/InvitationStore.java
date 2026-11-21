package org.linguacap.identity;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.linguacap.common.HttpError;
import org.linguacap.identity.InvitationResource.Invitation;

/** Invitations : une seule par adresse, réémise en place plutôt que dupliquée. */
@ApplicationScoped
class InvitationStore {
    private static final String SELECT = """
            select i.id, i.email, i.display_name, i.role, i.teacher_id, t.display_name as teacher_name, i.language_id,
                   i.invited_by, ib.display_name as invited_by_name, i.invited_user_id, i.created_at, i.sent_at,
                   i.last_sent_at, i.send_count, i.expires_at, i.cancelled_at, i.accepted_at, now() as checked_at
            from identity.invitations i
            left join identity.profiles t on t.id = i.teacher_id
            left join identity.profiles ib on ib.id = i.invited_by
            """;

    @Inject Database db;

    /** Ligne d'invitation avec son statut calculé au moment de la lecture. */
    record Row(UUID id, String email, String displayName, String role, UUID teacherId, String teacherName,
               String languageId, UUID invitedBy, String invitedByName, UUID invitedUserId, OffsetDateTime createdAt,
               OffsetDateTime sentAt, OffsetDateTime lastSentAt, int sendCount, OffsetDateTime expiresAt,
               OffsetDateTime cancelledAt, OffsetDateTime acceptedAt, String status) {

        Invitation view() {
            return new Invitation(id, email, displayName, role, teacherId, teacherName, languageId, invitedBy, invitedByName,
                    status, sendCount, IdentityStore.text(createdAt), IdentityStore.text(sentAt),
                    IdentityStore.text(lastSentAt), IdentityStore.text(expiresAt),
                    IdentityStore.text(cancelledAt), IdentityStore.text(acceptedAt));
        }
    }

    List<Invitation> list(UUID teacherScope) {
        String sql = SELECT + (teacherScope == null ? "" : " where i.teacher_id = ? or i.invited_by = ?")
                + " order by i.created_at desc, i.id limit 500";
        return db.read("list invitations", connection -> {
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                if (teacherScope != null) {
                    statement.setObject(1, teacherScope);
                    statement.setObject(2, teacherScope);
                }
                try (ResultSet rows = statement.executeQuery()) {
                    List<Invitation> invitations = new ArrayList<>();
                    while (rows.next()) invitations.add(row(rows).view());
                    return invitations;
                }
            }
        });
    }

    Row find(UUID id) {
        return db.read("read invitation", connection -> find(connection, "i.id = ?", id, false));
    }

    /** Statut de l'invitation liée à une adresse, pour expliquer un refus d'activation. */
    String statusFor(String email) {
        return db.read("read invitation status", connection -> {
            Row row = find(connection, "i.email = ?", email, false);
            return row == null ? null : row.status();
        });
    }

    /**
     * Crée l'invitation, ou met à jour l'invitation existante de cette adresse (réémission) :
     * nouveaux nom, rôle, référent et langue, annulation levée et validité repartant pour sept jours.
     */
    Row reserve(Account caller, String email, String displayName, String role, UUID teacherId, String languageId) {
        return db.transaction("reserve invitation", connection -> {
            Row existing = find(connection, "i.email = ?", email, true);
            if (existing == null) {
                try (PreparedStatement insert = connection.prepareStatement("""
                        insert into identity.invitations
                            (id, email, display_name, role, teacher_id, invited_by, expires_at, language_id)
                        values (?, ?, ?, ?, ?, ?, now() + interval '7 days', ?)
                        """)) {
                    insert.setObject(1, UUID.randomUUID());
                    insert.setString(2, email);
                    insert.setString(3, displayName);
                    insert.setString(4, role);
                    insert.setObject(5, teacherId);
                    insert.setObject(6, caller.id());
                    insert.setString(7, languageId);
                    insert.executeUpdate();
                }
                return find(connection, "i.email = ?", email, false);
            }
            if ("accepted".equals(existing.status())) {
                throw HttpError.conflict(caller.is("admin")
                        ? "Cette adresse correspond déjà à un compte LinguaCap. Gérez-le depuis la liste des utilisateurs."
                        : "Cette adresse correspond déjà à un compte LinguaCap. L’administration peut le rattacher à votre liste.");
            }
            if (!caller.is("admin") && "pending".equals(existing.status())
                    && !Objects.equals(existing.teacherId(), caller.id())) {
                throw HttpError.conflict("Une invitation est déjà en cours pour cette adresse.");
            }
            try (PreparedStatement update = connection.prepareStatement("""
                    update identity.invitations
                    set display_name = ?, role = ?, teacher_id = ?, language_id = ?, cancelled_at = null,
                        expires_at = now() + interval '7 days'
                    where id = ?
                    """)) {
                update.setString(1, displayName);
                update.setString(2, role);
                update.setObject(3, teacherId);
                update.setString(4, languageId);
                update.setObject(5, existing.id());
                update.executeUpdate();
            }
            return find(connection, "i.id = ?", existing.id(), false);
        });
    }

    /** Prolonge une invitation en attente ou expirée avant un renvoi. */
    Row extend(UUID id) {
        return db.transaction("extend invitation", connection -> {
            Row row = find(connection, "i.id = ?", id, true);
            if (row == null) throw HttpError.notFound("Invitation introuvable.");
            if ("accepted".equals(row.status())) throw HttpError.conflict("Cette invitation a déjà été acceptée.");
            if ("cancelled".equals(row.status())) {
                throw HttpError.conflict("Cette invitation est annulée. Invitez de nouveau cette adresse pour la réactiver.");
            }
            try (PreparedStatement update = connection.prepareStatement(
                    "update identity.invitations set expires_at = now() + interval '7 days' where id = ?")) {
                update.setObject(1, id);
                update.executeUpdate();
            }
            return find(connection, "i.id = ?", id, false);
        });
    }

    Row markSent(UUID id, UUID userId, UUID actorId, boolean reissued, String requestId) {
        return db.transaction("record invitation delivery", connection -> {
            Row row;
            try (PreparedStatement update = connection.prepareStatement("""
                    update identity.invitations
                    set invited_user_id = ?, sent_at = coalesce(sent_at, now()), last_sent_at = now(),
                        send_count = send_count + 1
                    where id = ? and (invited_user_id is null or invited_user_id = ?)
                    """)) {
                update.setObject(1, userId);
                update.setObject(2, id);
                update.setObject(3, userId);
                if (update.executeUpdate() == 0) {
                    throw HttpError.conflict("L’invitation est déjà liée à un autre compte.");
                }
            }
            row = find(connection, "i.id = ?", id, false);
            Map<String, Object> data = new HashMap<>();
            data.put("role", row.role());
            data.put("teacherId", row.teacherId() == null ? null : row.teacherId().toString());
            data.put("languageId", row.languageId());
            data.put("sendCount", row.sendCount());
            data.put("reissued", reissued);
            data.put("by", actorId == null ? null : actorId.toString());
            data.put("expiresAt", IdentityStore.text(row.expiresAt()));
            db.record(connection, "identity.invitation_sent", "invitation", id, null, requestId, data);
            return row;
        });
    }

    Row cancel(UUID id, UUID actorId, String requestId) {
        return db.transaction("cancel invitation", connection -> {
            Row row = find(connection, "i.id = ?", id, true);
            if (row == null) throw HttpError.notFound("Invitation introuvable.");
            if ("accepted".equals(row.status())) {
                throw HttpError.conflict("Cette invitation a déjà été acceptée : désactivez le compte si nécessaire.");
            }
            if ("cancelled".equals(row.status())) return row;
            try (PreparedStatement update = connection.prepareStatement(
                    "update identity.invitations set cancelled_at = now() where id = ?")) {
                update.setObject(1, id);
                update.executeUpdate();
            }
            db.record(connection, "identity.invitation_cancelled", "invitation", id, null, requestId,
                    Map.of("by", actorId.toString()));
            return find(connection, "i.id = ?", id, false);
        });
    }

    private Row find(Connection connection, String condition, Object value, boolean lock) throws SQLException {
        String sql = lock
                ? "select id from identity.invitations i where " + condition + " for update"
                : SELECT + " where " + condition;
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, value);
            try (ResultSet rows = statement.executeQuery()) {
                if (!rows.next()) return null;
                if (!lock) return row(rows);
            }
        }
        return find(connection, condition, value, false);
    }

    private static Row row(ResultSet rows) throws SQLException {
        OffsetDateTime acceptedAt = rows.getObject("accepted_at", OffsetDateTime.class);
        OffsetDateTime cancelledAt = rows.getObject("cancelled_at", OffsetDateTime.class);
        OffsetDateTime expiresAt = rows.getObject("expires_at", OffsetDateTime.class);
        OffsetDateTime now = rows.getObject("checked_at", OffsetDateTime.class);
        return new Row(rows.getObject("id", UUID.class), rows.getString("email"), rows.getString("display_name"),
                rows.getString("role"), rows.getObject("teacher_id", UUID.class), rows.getString("teacher_name"),
                rows.getString("language_id"), rows.getObject("invited_by", UUID.class), rows.getString("invited_by_name"),
                rows.getObject("invited_user_id", UUID.class), rows.getObject("created_at", OffsetDateTime.class),
                rows.getObject("sent_at", OffsetDateTime.class), rows.getObject("last_sent_at", OffsetDateTime.class),
                rows.getInt("send_count"), expiresAt, cancelledAt, acceptedAt,
                AccountRules.invitationStatus(acceptedAt, cancelledAt, expiresAt, now));
    }
}
