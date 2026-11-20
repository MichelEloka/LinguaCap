package org.linguacap.common;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.jboss.logging.MDC;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;
import org.jboss.resteasy.reactive.server.ServerResponseFilter;

/**
 * Journaux corrélés (DEV-102) : chaque requête porte l'identifiant transmis par la passerelle (en-tête X-Request-Id),
 * ou un nouvel identifiant à l'entrée de la passerelle. Il figure dans toutes les lignes de journal de la requête
 * (format de journal partagé) et une ligne de synthèse est écrite à la réponse : méthode, route, statut et durée,
 * sans paramètres ni contenu. Les sondes de santé ne sont pas journalisées.
 */
public class RequestLog {
    public static final String HEADER = "X-Request-Id";
    private static final String KEY = "requestId";
    private static final String STARTED = "linguacap.started";
    private static final Logger LOG = Logger.getLogger("org.linguacap.requests");

    /** Identifiant de la requête en cours, ou un nouvel identifiant hors requête. */
    public static String current() {
        String id = active();
        return id.isEmpty() ? UUID.randomUUID().toString() : id;
    }

    /** Identifiant de la requête en cours, vide hors requête. */
    public static String active() {
        Object value = MDC.get(KEY);
        return value instanceof String id && id.matches("[A-Za-z0-9-]{1,64}") ? id : "";
    }

    @ServerRequestFilter(preMatching = true)
    public void start(ContainerRequestContext request) {
        String incoming = request.getHeaderString(HEADER);
        String id = incoming != null && incoming.matches("[A-Za-z0-9-]{1,64}") ? incoming : UUID.randomUUID().toString();
        MDC.put(KEY, id);
        request.setProperty(STARTED, System.nanoTime());
    }

    @ServerResponseFilter
    public void finish(ContainerRequestContext request, ContainerResponseContext response) {
        String path = request.getUriInfo().getPath();
        if (!path.endsWith("/health")) {
            Object started = request.getProperty(STARTED);
            long millis = started instanceof Long value ? (System.nanoTime() - value) / 1_000_000 : -1;
            int status = response.getStatus();
            String line = request.getMethod() + " " + path + " → " + status + " en " + millis + " ms";
            if (status >= 500) LOG.warn(line);
            else LOG.info(line);
        }
        MDC.remove(KEY);
    }
}
