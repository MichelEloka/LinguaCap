-- Incrément 3 · versions des médias et espace privé des productions orales (DEV-026).
-- Un fichier validé est immuable : le remplacer crée une nouvelle version, l'ancienne reste lisible.

create table media.asset_versions (
    asset_id text not null references media.assets(id),
    version integer not null check (version > 0),
    bucket text not null check (bucket = 'linguacap-course'),
    object_path text not null check (object_path ~ '^[a-z0-9-]+/[a-z0-9][a-z0-9.-]*$'),
    mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav')),
    size_bytes bigint check (size_bytes > 0),
    width integer check (width > 0),
    height integer check (height > 0),
    duration_ms integer check (duration_ms > 0),
    alt text,
    transcript text,
    credit text,
    status text not null check (status in ('draft', 'published', 'archived')),
    created_at timestamptz not null default now(),
    primary key (asset_id, version),
    unique (bucket, object_path)
);

insert into media.asset_versions (asset_id, version, bucket, object_path, mime_type, alt, transcript, credit, status)
select id, 1, bucket, object_path, mime_type, alt, transcript, credit, status from media.assets;

-- Les autorisations de lecture temporaires visent désormais une version de fichier.
alter table media.storage_read_grants drop constraint storage_read_grants_bucket_object_path_fkey;
alter table media.storage_read_grants add constraint storage_read_grants_version_fkey
    foreign key (bucket, object_path) references media.asset_versions(bucket, object_path);

do $storage$
begin
    if to_regclass('storage.buckets') is not null then
        -- Productions orales des élèves : privé, sans politique de lecture tant que les remises ne sont pas ouvertes.
        insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        values ('linguacap-productions', 'linguacap-productions', false, 26214400,
                array['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav'])
        on conflict (id) do update
            set public = false, file_size_limit = excluded.file_size_limit,
                allowed_mime_types = excluded.allowed_mime_types;
        update storage.buckets
           set file_size_limit = 15728640,
               allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav']
         where id = 'linguacap-course';
    end if;
end;
$storage$;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_media') then
        grant select on media.asset_versions to lingua_media;
    end if;
end;
$$;
