package org.linguacap.identity;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;

/** Compte de l'appelant : activation à la première connexion, refus d'un compte désactivé, dernière activité. */
@RequestScoped
class Accounts {
    @Inject Actor actor;
    @Inject IdentityStore store;
    @Inject InvitationStore invitations;

    private Account current;

    Account current() {
        if (current != null) return current;
        UUID id = actor.id();
        Account account = store.findAccount(id);
        String email = AccountRules.normalizeEmail(actor.email());
        if (account == null && actor.emailVerified() && !email.isEmpty()) {
            account = store.activate(id, email, actor.requestId());
            if (account == null) {
                String status = invitations.statusFor(email);
                if ("expired".equals(status)) {
                    throw HttpError.forbidden("Votre invitation a expiré. Demandez à la personne qui vous a invité de la renvoyer.");
                }
                if ("cancelled".equals(status)) {
                    throw HttpError.forbidden("Votre invitation a été annulée. Contactez la personne qui vous a invité.");
                }
            }
        }
        if (account == null) {
            throw HttpError.forbidden("Ce compte ne dispose pas encore d’un accès à LinguaCap.");
        }
        if (!account.active()) {
            throw HttpError.forbidden("Ce compte est désactivé. Contactez l’administration de LinguaCap.");
        }
        if (AccountRules.lastSeenIsStale(account.lastSeenAt(), OffsetDateTime.now())) {
            store.touch(id);
        }
        current = account;
        return account;
    }

    Account requireAdmin() {
        Account caller = current();
        if (!caller.is("admin")) {
            throw HttpError.forbidden("Cette action est réservée à l’administration.");
        }
        return caller;
    }

    String requestId() {
        return actor.requestId();
    }
}
