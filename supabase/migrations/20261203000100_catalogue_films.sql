-- Ciné-club (EVO-055) · films et séquences du catalogue, pour s'entraîner avec un film hors parcours.
-- Additif : aucune table existante ne change. Un film est lu par le lecteur YouTube officiel (youtube-nocookie) : le
-- catalogue ne garde que l'identifiant de la vidéo, ses liens et son crédit, jamais de fichier, de sous-titre ni de
-- transcription. Les questions « après » de chaque séquence sont une leçon du catalogue sans version
-- (cine-<séquence>), avec les tables de questions existantes : elles sont corrigées par Évaluations
-- (POST /assessments/exercises, clé exercise-key) comme toute leçon.
-- Droits : lingua_catalogue lit et écrit les deux tables (aussi dans infra/pilot/db-grants.sql, la recette créant les
-- rôles après les migrations).

create table catalogue.films (
    id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id) <= 48),
    language_id text not null references catalogue.languages(id),
    level_id text not null references catalogue.levels(id),
    title text not null check (length(btrim(title)) between 1 and 120),
    description text not null default '' check (length(description) <= 2000),
    provider text not null default 'youtube' check (provider = 'youtube'),
    video_id text not null check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
    channel text not null check (length(btrim(channel)) between 1 and 120),
    video_url text not null check (video_url = 'https://www.youtube.com/watch?v=' || video_id),
    course_url text not null default '' check (course_url = '' or course_url ~ '^https://[^\s]+$' and length(course_url) <= 300),
    credit text not null check (length(btrim(credit)) between 1 and 300),
    license_note text not null default '' check (length(license_note) <= 1000),
    duration_seconds integer not null check (duration_seconds between 60 and 14400),
    position integer not null default 1 check (position between 1 and 100),
    status text not null default 'draft' check (status in ('draft', 'published')),
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    published_at timestamptz,
    check (status = 'draft' or published_at is not null)
);
create index films_level_idx on catalogue.films (language_id, level_id, position);
revoke all on catalogue.films from public, anon, authenticated;

-- Séquence de 3 à 15 minutes : bornes dans la vidéo (approx : à vérifier en regardant), contexte « avant », mots-clés
-- et leçon des questions « après ». Les mots-clés sont des textes originaux ({word, article, plural, translation, note}).
create table catalogue.film_sequences (
    id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id) <= 59),
    film_id text not null references catalogue.films(id),
    position integer not null check (position between 1 and 100),
    title text not null check (length(title) <= 160),
    start_seconds integer not null check (start_seconds >= 0),
    end_seconds integer not null,
    bounds_approx boolean not null default false,
    context text not null default '' check (length(context) <= 4000),
    keywords jsonb not null default '[]' check (jsonb_typeof(keywords) = 'array' and jsonb_array_length(keywords) <= 10),
    lesson_id text not null unique references catalogue.lessons(id),
    check (end_seconds - start_seconds between 180 and 900),
    check (lesson_id = 'cine-' || id),
    unique (film_id, position)
);
revoke all on catalogue.film_sequences from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_catalogue') then
        grant select, insert, update on catalogue.films to lingua_catalogue;
        grant select, insert, update, delete on catalogue.film_sequences to lingua_catalogue;
    end if;
end;
$$;
