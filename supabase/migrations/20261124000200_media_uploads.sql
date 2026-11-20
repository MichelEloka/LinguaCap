-- Incrément 5 · dépôt direct vers le stockage privé, contrôle du fichier et versions de média (DEV-049 à DEV-053).

alter table media.assets
    add column source text,
    add column license text,
    add column created_by uuid,
    add column updated_at timestamptz not null default now();
alter table media.assets drop constraint assets_mime_type_check;
alter table media.assets add constraint assets_mime_type_check
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav'));

-- Un dépôt réserve un chemin pour un auteur et un usage. Il expire s'il n'est pas finalisé à temps.
create table media.uploads (
    id uuid primary key,
    actor_id uuid not null,
    asset_id text not null check (asset_id ~ '^[a-z0-9-]{1,64}$'),
    replaces boolean not null default false,
    kind text not null check (kind in ('image', 'audio')),
    title text not null check (length(btrim(title)) between 1 and 120),
    declared_mime text not null check (declared_mime in ('image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav')),
    declared_size bigint not null check (declared_size > 0),
    bucket text not null check (bucket = 'linguacap-course'),
    object_path text not null unique check (object_path ~ '^[a-z0-9-]+/[a-z0-9][a-z0-9.-]*$'),
    source text,
    license text,
    alt text,
    transcript text,
    status text not null default 'pending' check (status in ('pending', 'available', 'rejected', 'abandoned')),
    reason text,
    version integer,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    finalized_at timestamptz
);
create index uploads_actor_idx on media.uploads (actor_id, created_at desc);
create index uploads_pending_idx on media.uploads (expires_at) where status = 'pending';
revoke all on media.uploads from public, anon, authenticated;

do $storage$
begin
    if to_regclass('storage.objects') is not null and to_regprocedure('auth.uid()') is not null then
        -- Le navigateur dépose uniquement au chemin réservé, par son auteur, avant l'expiration.
        create function media.can_upload_storage_object(requested_bucket text, requested_path text)
        returns boolean
        language sql
        stable
        security definer
        set search_path = ''
        as $policy$
            select exists (
                select 1 from media.uploads upload_row
                where upload_row.actor_id = auth.uid()
                      and upload_row.bucket = requested_bucket
                      and upload_row.object_path = requested_path
                      and upload_row.status = 'pending'
                      and upload_row.expires_at > now()
            )
        $policy$;
        revoke all on function media.can_upload_storage_object(text, text) from public;
        grant execute on function media.can_upload_storage_object(text, text) to authenticated;

        create policy "LinguaCap reserved course upload"
            on storage.objects for insert to authenticated
            with check (bucket_id = 'linguacap-course' and media.can_upload_storage_object(bucket_id, name));
        -- Tant que le dépôt attend sa finalisation, son auteur peut le relire (Médias en contrôle la taille, le type
        -- et la signature) ou le supprimer (fichier refusé ou dépôt abandonné), même après l'expiration du dépôt.
        create function media.can_check_pending_upload(requested_bucket text, requested_path text)
        returns boolean
        language sql
        stable
        security definer
        set search_path = ''
        as $policy$
            select exists (
                select 1 from media.uploads upload_row
                where upload_row.actor_id = auth.uid()
                      and upload_row.bucket = requested_bucket
                      and upload_row.object_path = requested_path
                      and upload_row.status = 'pending'
            )
        $policy$;
        revoke all on function media.can_check_pending_upload(text, text) from public;
        grant execute on function media.can_check_pending_upload(text, text) to authenticated;

        create policy "LinguaCap pending upload check"
            on storage.objects for select to authenticated
            using (bucket_id = 'linguacap-course' and media.can_check_pending_upload(bucket_id, name));
        create policy "LinguaCap pending upload discard"
            on storage.objects for delete to authenticated
            using (bucket_id = 'linguacap-course' and media.can_check_pending_upload(bucket_id, name));
    end if;
end;
$storage$;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_media') then
        grant select, insert, update on media.assets, media.asset_versions, media.uploads to lingua_media;
    end if;
end;
$$;
