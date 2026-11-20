create schema if not exists media;
revoke all on schema media from public;

create table media.assets (
    id text primary key,
    kind text not null check (kind in ('image', 'audio')),
    title text not null,
    mime_type text not null check (mime_type in ('image/jpeg', 'audio/wav')),
    bucket text not null check (bucket = 'linguacap-course'),
    object_path text not null check (object_path ~ '^[a-z0-9-]+/[a-z0-9][a-z0-9.-]*$'),
    alt text,
    transcript text,
    credit text,
    status text not null check (status in ('published', 'draft')),
    unique (bucket, object_path)
);

create table media.storage_read_grants (
    actor_id uuid not null,
    bucket text not null,
    object_path text not null,
    expires_at timestamptz not null,
    primary key (actor_id, bucket, object_path),
    foreign key (bucket, object_path) references media.assets(bucket, object_path)
);

insert into media.assets
    (id, kind, title, mime_type, bucket, object_path, alt, transcript, credit, status)
values
    ('kaffee-image', 'image', 'Une tasse de café', 'image/jpeg', 'linguacap-course', 'a1/kaffee.jpg',
     'Une tasse blanche remplie de café sur une soucoupe.', null, 'Douglas Perkins · CC0 1.0', 'published'),
    ('kaffee-audio', 'audio', 'Prononciation de « Kaffee »', 'audio/wav', 'linguacap-course', 'a1/kaffee.wav',
     null, 'Kaffee. Ich möchte einen Kaffee, bitte.', 'Voix de synthèse allemande · eSpeak NG', 'published');

-- The lightweight PostgreSQL test database can run these migrations without Supabase Storage.
do $storage$
begin
    if to_regclass('storage.objects') is not null
       and to_regclass('storage.buckets') is not null
       and to_regprocedure('auth.uid()') is not null then
        insert into storage.buckets (id, name, public)
        values ('linguacap-course', 'linguacap-course', false)
        on conflict (id) do update set public = false;

        create function media.can_read_storage_object(requested_bucket text, requested_path text)
        returns boolean
        language sql
        stable
        security definer
        set search_path = ''
        as $policy$
            select exists (
                select 1
                from media.storage_read_grants grant_row
                where grant_row.actor_id = auth.uid()
                      and grant_row.bucket = requested_bucket
                      and grant_row.object_path = requested_path
                      and grant_row.expires_at > now()
            )
        $policy$;

        revoke all on function media.can_read_storage_object(text, text) from public;
        grant usage on schema media to authenticated;
        grant execute on function media.can_read_storage_object(text, text) to authenticated;

        create policy "LinguaCap temporary course media read"
            on storage.objects for select to authenticated
            using (bucket_id = 'linguacap-course' and media.can_read_storage_object(bucket_id, name));
    end if;
end;
$storage$;
