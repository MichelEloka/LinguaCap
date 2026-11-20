-- Incrément 5 · édition du catalogue : contenus rattachés à une version et figés à la publication (DEV-047 à DEV-058).

-- Une leçon (et ses questions) appartient à une version : publier la version fige son contenu et ses corrigés.
alter table catalogue.lessons add column version_id uuid references catalogue.track_versions(id);
update catalogue.lessons set version_id = 'a1000000-0000-4000-8000-000000000001'
 where id in ('commander-au-cafe', 'diagnostic-a1');
update catalogue.lessons set version_id = 'a2000000-0000-4000-8000-000000000001'
 where id in ('ma-journee', 'diagnostic-a2');

alter table catalogue.track_versions
    add column created_by uuid,
    add column updated_at timestamptz not null default now();

-- Un support peut illustrer l'activité, une question ou un choix de réponse.
-- Une image décorative est identifiée comme telle ; le texte alternatif des autres images est exigé à la publication,
-- pour qu'un brouillon incomplet reste enregistrable.
alter table catalogue.media_placements
    drop constraint media_placements_check,
    add column decorative boolean not null default false,
    add column question_id text,
    add column option_id text,
    add constraint media_placements_target_check check (option_id is null or question_id is not null);

-- Un brouillon peut garder un titre ou un objectif vide le temps de l'édition : le contrôle de publication les exige.
alter table catalogue.modules
    drop constraint modules_title_check,
    drop constraint modules_objective_check,
    add constraint modules_title_check check (length(title) <= 120),
    add constraint modules_objective_check check (length(objective) <= 500);
alter table catalogue.activities
    drop constraint activities_title_check,
    add constraint activities_title_check check (length(title) <= 120);

create function catalogue.ensure_lesson_editable() returns trigger
    language plpgsql
    set search_path = ''
as $$
begin
    -- Chaque fonction ne lit que les colonnes de sa table : PL/pgSQL résout les champs même hors de la branche suivie.
    if exists (select 1 from catalogue.track_versions v
               where v.status <> 'draft'
                 and v.id in ((case when tg_op = 'INSERT' then null else old.version_id end),
                              (case when tg_op = 'DELETE' then null else new.version_id end))) then
        raise exception 'Cette version du parcours est publiée : créez une nouvelle version pour la modifier.';
    end if;
    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- Questions et choix de réponse suivent l'état de la version de leur leçon.
create function catalogue.ensure_question_editable() returns trigger
    language plpgsql
    set search_path = ''
as $$
begin
    if exists (select 1 from catalogue.lessons l join catalogue.track_versions v on v.id = l.version_id
               where v.status <> 'draft'
                 and l.id in ((case when tg_op = 'INSERT' then null else old.lesson_id end),
                              (case when tg_op = 'DELETE' then null else new.lesson_id end))) then
        raise exception 'Cette version du parcours est publiée : créez une nouvelle version pour la modifier.';
    end if;
    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger lessons_frozen before update or delete on catalogue.lessons
    for each row execute function catalogue.ensure_lesson_editable();
create trigger questions_frozen before insert or update or delete on catalogue.questions
    for each row execute function catalogue.ensure_question_editable();
create trigger options_frozen before insert or update or delete on catalogue.options
    for each row execute function catalogue.ensure_question_editable();

-- Bilan intermédiaire et examen blanc de la version (DEV-054) : parties par compétence, questions fermées avec
-- corrigé, consignes des productions écrites et orales et grille de correction. Figés avec la version.
create table catalogue.version_assessments (
    version_id uuid not null references catalogue.track_versions(id),
    kind text not null check (kind in ('midterm', 'final')),
    title text not null check (length(title) <= 120),
    description text not null default '' check (length(description) <= 2000),
    parts jsonb not null default '[]' check (jsonb_typeof(parts) = 'array'),
    primary key (version_id, kind)
);
revoke all on catalogue.version_assessments from public, anon, authenticated;
create trigger version_assessments_frozen before insert or update or delete on catalogue.version_assessments
    for each row execute function catalogue.ensure_version_editable();

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_catalogue') then
        grant select, insert, update on catalogue.track_versions to lingua_catalogue;
        grant select, insert, update, delete on catalogue.modules, catalogue.activities, catalogue.media_placements,
            catalogue.lessons, catalogue.questions, catalogue.options, catalogue.version_assessments to lingua_catalogue;
    end if;
end;
$$;
