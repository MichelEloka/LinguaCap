-- Incrément « Parcours » · langue de l'élève et profil du professeur (accueil guidé).
-- Migration additive, compatible avec la version précédente du service Identités pendant le déploiement :
-- colonnes facultatives, nouvelle table, aucune contrainte existante modifiée.

-- Langue apprise par l'élève : venue de l'invitation, du professeur référent, ou choisie par l'élève autonome.
alter table identity.profiles add column language_id text check (language_id ~ '^[a-z]{2}$');
-- Langue prévue par l'invitation d'un élève (facultative : à défaut, la première langue du professeur).
alter table identity.invitations add column language_id text check (language_id ~ '^[a-z]{2}$');

-- Profil du professeur, renseigné par le questionnaire d'accueil. onboarded_at marque la première validation.
create table identity.teacher_profiles (
    profile_id uuid primary key references identity.profiles(id),
    languages text[] not null default '{}'
        check (cardinality(languages) <= 20 and array_to_string(languages, ',') ~ '^([a-z]{2}(,[a-z]{2})*)?$'),
    levels text[] not null default '{}' check (levels <@ array['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    max_learners integer check (max_learners between 1 and 500),
    grading_delay_hours integer check (grading_delay_hours in (24, 48, 72, 168)),
    bio text not null default '' check (length(bio) <= 500),
    onboarded_at timestamptz,
    updated_at timestamptz not null default now()
);

-- Reprise : le pilote est en allemand. Les élèves existants et les invitations d'élèves encore ouvertes
-- apprennent l'allemand ; les professeurs existants sont réputés accueillis (pas de questionnaire).
update identity.profiles set language_id = 'de' where role = 'learner' and language_id is null;
update identity.invitations set language_id = 'de'
 where role = 'learner' and language_id is null and accepted_at is null;
insert into identity.teacher_profiles (profile_id, languages, levels, onboarded_at)
select id, array['de'], array['A1', 'A2'], now() from identity.profiles where role = 'teacher'
on conflict do nothing;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_identity') then
        grant select, insert, update on identity.teacher_profiles to lingua_identity;
    end if;
end;
$$;
