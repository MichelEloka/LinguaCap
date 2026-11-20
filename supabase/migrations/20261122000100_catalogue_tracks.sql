-- Incrément 3 · catalogue versionné : langue → niveau → version de parcours → modules → activités (DEV-025, DEV-027).
-- Additif : les tables du pilote (levels, lessons, questions, options) restent lues par la version précédente du service.

create table catalogue.languages (
    id text primary key check (id ~ '^[a-z]{2}$'),
    name text not null check (length(btrim(name)) between 1 and 60)
);
insert into catalogue.languages (id, name) values ('de', 'Allemand');

alter table catalogue.levels
    add column language_id text not null default 'de' references catalogue.languages(id),
    add column position integer check (position > 0);
update catalogue.levels
   set position = array_position(array['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], code);

create table catalogue.competences (
    id text primary key check (id ~ '^[a-z]+(-[a-z]+)*$'),
    name text not null,
    position integer not null unique check (position > 0)
);
insert into catalogue.competences (id, name, position) values
    ('lecture', 'Lecture', 1),
    ('ecoute', 'Écoute', 2),
    ('expression-ecrite', 'Expression écrite', 3),
    ('expression-orale', 'Expression orale', 4);

-- Une version publiée est attribuable. Une version retirée reste lisible pour les élèves déjà inscrits.
create table catalogue.track_versions (
    id uuid primary key default gen_random_uuid(),
    level_id text not null references catalogue.levels(id),
    number integer not null check (number > 0),
    status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
    created_at timestamptz not null default now(),
    published_at timestamptz,
    retired_at timestamptz,
    unique (level_id, number),
    check (status = 'draft' or published_at is not null)
);
create unique index track_versions_one_published_idx on catalogue.track_versions (level_id) where status = 'published';

create table catalogue.modules (
    version_id uuid not null references catalogue.track_versions(id),
    id text not null check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    position integer not null check (position > 0),
    title text not null check (length(btrim(title)) between 1 and 120),
    objective text not null check (length(btrim(objective)) between 1 and 500),
    prerequisites text[] not null default '{}',
    primary key (version_id, id),
    unique (version_id, position)
);

create table catalogue.activities (
    version_id uuid not null,
    id text not null check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    module_id text not null,
    position integer not null check (position > 0),
    kind text not null check (kind in ('lesson', 'exercise', 'review', 'assessment')),
    title text not null check (length(btrim(title)) between 1 and 120),
    estimated_minutes integer not null check (estimated_minutes between 1 and 240),
    competences text[] not null default '{}',
    lesson_id text references catalogue.lessons(id),
    primary key (version_id, id),
    foreign key (version_id, module_id) references catalogue.modules(version_id, id),
    unique (version_id, module_id, position)
);

-- Un support référence une version précise d'un média : la remplacer exige une nouvelle version du parcours.
create table catalogue.media_placements (
    version_id uuid not null,
    activity_id text not null,
    position integer not null check (position > 0),
    asset_id text not null check (asset_id ~ '^[a-z0-9-]{1,64}$'),
    asset_version integer not null check (asset_version > 0),
    usage text not null check (usage in ('illustration', 'audio')),
    alt text,
    caption text,
    transcript_visibility text not null default 'on_demand'
        check (transcript_visibility in ('on_demand', 'after_answer', 'hidden')),
    primary key (version_id, activity_id, position),
    foreign key (version_id, activity_id) references catalogue.activities(version_id, id),
    check (usage <> 'illustration' or length(btrim(coalesce(alt, ''))) > 0)
);

-- Une version publiée ou retirée est figée : ses modules, activités et supports ne changent plus.
create function catalogue.ensure_version_editable() returns trigger
    language plpgsql
    set search_path = ''
as $$
declare
    target uuid := case when tg_op = 'DELETE' then old.version_id else new.version_id end;
begin
    if (select status from catalogue.track_versions where id = target) <> 'draft'
       or (tg_op = 'UPDATE' and old.version_id <> new.version_id
           and (select status from catalogue.track_versions where id = old.version_id) <> 'draft') then
        raise exception 'Cette version du parcours est publiée : créez une nouvelle version pour la modifier.';
    end if;
    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger modules_frozen before insert or update or delete on catalogue.modules
    for each row execute function catalogue.ensure_version_editable();
create trigger activities_frozen before insert or update or delete on catalogue.activities
    for each row execute function catalogue.ensure_version_editable();
create trigger media_placements_frozen before insert or update or delete on catalogue.media_placements
    for each row execute function catalogue.ensure_version_editable();

-- Parcours A1 de démonstration : un module, une leçon illustrée avec audio, un exercice fermé.
insert into catalogue.track_versions (id, level_id, number)
values ('a1000000-0000-4000-8000-000000000001', 'a1', 1);

insert into catalogue.modules (version_id, id, position, title, objective) values
    ('a1000000-0000-4000-8000-000000000001', 'au-cafe', 1, 'Au café',
     'Comprendre une commande simple à l’oral et commander une boisson poliment.');

insert into catalogue.activities
    (version_id, id, module_id, position, kind, title, estimated_minutes, competences, lesson_id)
values
    ('a1000000-0000-4000-8000-000000000001', 'commander-au-cafe', 'au-cafe', 1, 'lesson',
     'Commander au café', 10, array['ecoute', 'lecture'], 'commander-au-cafe'),
    ('a1000000-0000-4000-8000-000000000001', 'quiz-la-commande', 'au-cafe', 2, 'exercise',
     'Exercice : la commande', 5, array['ecoute'], 'commander-au-cafe');

insert into catalogue.media_placements
    (version_id, activity_id, position, asset_id, asset_version, usage, alt, caption, transcript_visibility)
values
    ('a1000000-0000-4000-8000-000000000001', 'commander-au-cafe', 1, 'kaffee-image', 1, 'illustration',
     'Une tasse blanche remplie de café posée sur une soucoupe.', 'Ein Kaffee, bitte.', 'hidden'),
    ('a1000000-0000-4000-8000-000000000001', 'commander-au-cafe', 2, 'kaffee-audio', 1, 'audio',
     null, 'Une cliente commande au comptoir.', 'on_demand'),
    ('a1000000-0000-4000-8000-000000000001', 'quiz-la-commande', 1, 'kaffee-audio', 1, 'audio',
     null, 'Réécoutez la commande avant de répondre.', 'after_answer');

update catalogue.track_versions set status = 'published', published_at = now()
 where id = 'a1000000-0000-4000-8000-000000000001';

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_catalogue') then
        grant select on catalogue.languages, catalogue.competences, catalogue.track_versions,
            catalogue.modules, catalogue.activities, catalogue.media_placements to lingua_catalogue;
    end if;
end;
$$;
