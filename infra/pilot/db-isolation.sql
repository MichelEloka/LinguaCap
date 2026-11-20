-- Vérifie l'isolation des rôles SQL d'exécution LinguaCap (DEV-009).
-- Chaque rôle lingua_<service> n'accède qu'à son schéma, sans droit de DDL ni privilège étendu.
-- Exécuté en recette (Supabase local) et après les migrations de production. Lecture seule : échoue au premier écart.
DO $isolation$
DECLARE
    services constant text[] := ARRAY['identity', 'catalogue', 'media', 'learning', 'assessment', 'tracking'];
    service text;
    other text;
    role_name text;
    item record;
    violations text[] := ARRAY[]::text[];
BEGIN
    FOREACH service IN ARRAY services LOOP
        role_name := 'lingua_' || service;

        SELECT rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication
          INTO item FROM pg_roles WHERE rolname = role_name;
        IF NOT FOUND THEN
            violations := violations || format('%s : rôle absent', role_name);
            CONTINUE;
        END IF;
        IF item.rolsuper OR item.rolbypassrls OR item.rolcreaterole OR item.rolcreatedb OR item.rolreplication THEN
            violations := violations || format('%s : attribut privilégié', role_name);
        END IF;

        FOR item IN
            SELECT parent.rolname FROM pg_auth_members membership
              JOIN pg_roles parent ON parent.oid = membership.roleid
              JOIN pg_roles child ON child.oid = membership.member
             WHERE child.rolname = role_name
        LOOP
            violations := violations || format('%s : hérite du rôle %s', role_name, item.rolname);
        END LOOP;

        IF NOT has_schema_privilege(role_name, service, 'USAGE') THEN
            violations := violations || format('%s : accès manquant à son schéma %s', role_name, service);
        END IF;
        IF has_schema_privilege(role_name, service, 'CREATE') THEN
            violations := violations || format('%s : peut créer des objets dans %s', role_name, service);
        END IF;

        FOREACH other IN ARRAY services || ARRAY['auth', 'storage'] LOOP
            CONTINUE WHEN other = service OR to_regnamespace(other) IS NULL;
            IF has_schema_privilege(role_name, other, 'USAGE') OR has_schema_privilege(role_name, other, 'CREATE') THEN
                violations := violations || format('%s : accès au schéma %s', role_name, other);
            END IF;
            FOR item IN
                SELECT c.oid::regclass AS relation FROM pg_class c
                  JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE n.nspname = other AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
            LOOP
                IF has_table_privilege(role_name, item.relation, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER') THEN
                    violations := violations || format('%s : droit sur la table %s', role_name, item.relation);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    IF cardinality(violations) > 0 THEN
        RAISE EXCEPTION 'Isolation SQL LinguaCap rompue :%', E'\n- ' || array_to_string(violations, E'\n- ');
    END IF;
    RAISE NOTICE 'Isolation SQL vérifiée pour % rôles de service.', cardinality(services);
END
$isolation$;
