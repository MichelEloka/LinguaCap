-- Incrément 6 · productions orales privées (DEV-064, DEV-065) : hors de la médiathèque pédagogique, déposées par
-- le parcours direct de Médias et lisibles par leur élève et les correcteurs habilités, après contrôle par Évaluations.

create table media.productions (
    id uuid primary key,
    owner_id uuid not null,
    attempt_id uuid not null,
    part_id text not null check (part_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    bucket text not null check (bucket = 'linguacap-productions'),
    object_path text not null unique check (object_path ~ '^[a-f0-9-]+/[a-f0-9-]+/[a-z0-9][a-z0-9.-]*$'),
    declared_mime text not null
        check (declared_mime in ('audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav')),
    declared_size bigint not null check (declared_size between 1 and 26214400),
    size_bytes bigint check (size_bytes > 0),
    status text not null default 'pending' check (status in ('pending', 'available', 'rejected', 'abandoned')),
    reason text,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    finalized_at timestamptz
);
create index productions_attempt_idx on media.productions (attempt_id, part_id, created_at desc);
revoke all on media.productions from public, anon, authenticated;

-- Autorisations de lecture de 60 secondes, délivrées après le contrôle des droits par Évaluations.
create table media.production_read_grants (
    actor_id uuid not null,
    object_path text not null references media.productions(object_path),
    expires_at timestamptz not null,
    primary key (actor_id, object_path)
);
revoke all on media.production_read_grants from public, anon, authenticated;

do $storage$
begin
    if to_regclass('storage.objects') is not null and to_regprocedure('auth.uid()') is not null then
        create function media.can_upload_production(requested_bucket text, requested_path text)
        returns boolean
        language sql
        stable
        security definer
        set search_path = ''
        as $policy$
            select exists (
                select 1 from media.productions production
                where production.owner_id = auth.uid()
                      and production.bucket = requested_bucket
                      and production.object_path = requested_path
                      and production.status = 'pending'
                      and production.expires_at > now()
            )
        $policy$;

        -- Le dépôt en attente reste lisible et supprimable par son élève (contrôle, refus ou abandon).
        create function media.can_check_production(requested_bucket text, requested_path text)
        returns boolean
        language sql
        stable
        security definer
        set search_path = ''
        as $policy$
            select exists (
                select 1 from media.productions production
                where production.owner_id = auth.uid()
                      and production.bucket = requested_bucket
                      and production.object_path = requested_path
                      and production.status = 'pending'
            )
        $policy$;

        create function media.can_read_production(requested_bucket text, requested_path text)
        returns boolean
        language sql
        stable
        security definer
        set search_path = ''
        as $policy$
            select requested_bucket = 'linguacap-productions' and exists (
                select 1 from media.production_read_grants grant_row
                where grant_row.actor_id = auth.uid()
                      and grant_row.object_path = requested_path
                      and grant_row.expires_at > now()
            )
        $policy$;

        revoke all on function media.can_upload_production(text, text) from public;
        revoke all on function media.can_check_production(text, text) from public;
        revoke all on function media.can_read_production(text, text) from public;
        grant execute on function media.can_upload_production(text, text) to authenticated;
        grant execute on function media.can_check_production(text, text) to authenticated;
        grant execute on function media.can_read_production(text, text) to authenticated;

        create policy "LinguaCap reserved production upload"
            on storage.objects for insert to authenticated
            with check (bucket_id = 'linguacap-productions' and media.can_upload_production(bucket_id, name));
        create policy "LinguaCap production check or read"
            on storage.objects for select to authenticated
            using (bucket_id = 'linguacap-productions'
                   and (media.can_check_production(bucket_id, name) or media.can_read_production(bucket_id, name)));
        create policy "LinguaCap pending production discard"
            on storage.objects for delete to authenticated
            using (bucket_id = 'linguacap-productions' and media.can_check_production(bucket_id, name));
    end if;
end;
$storage$;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_media') then
        grant select, insert, update on media.productions to lingua_media;
        grant select, insert, update, delete on media.production_read_grants to lingua_media;
    end if;
end;
$$;
