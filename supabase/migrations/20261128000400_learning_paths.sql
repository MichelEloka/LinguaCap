-- Incrément « Parcours » · parcours multi-niveaux, planning global, contrat et ajouts de cours.
-- Additive : chaque niveau d'un parcours reste une inscription (learning.enrollments), créée à l'ouverture du niveau.
-- Les niveaux suivants ne sont qu'une projection tirée de la révision validée du planning global.

-- Le parcours : langue, niveau de départ, niveau visé, dates, charge, contrat et planning global.
create table learning.paths (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    language_id text not null default 'de' check (language_id ~ '^[a-z]{2}$'),
    status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'withdrawn')),
    start_level text not null check (start_level ~ '^(A0|[ABC][12])$'),
    target_level text not null check (target_level ~ '^[ABC][12]$'),
    start_date date not null,
    target_date date not null,
    initial_target_date date not null,
    weekly_minutes integer not null default 0 check (weekly_minutes between 0 and 5040),
    required_minutes integer not null default 0 check (required_minutes >= 0),
    difficulty text not null default 'moderate'
        check (difficulty in ('light', 'moderate', 'sustained', 'intensive', 'very_intensive', 'unrealistic')),
    placement_attempt_id uuid,
    origin text not null default 'onboarding' check (origin in ('onboarding', 'assignment', 'migration')),
    validated_revision integer not null default 0 check (validated_revision >= 0),
    availability_confirmed_at timestamptz,
    paused_at timestamptz,
    resume_date date,
    created_by uuid not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    ended_at timestamptz,
    check (target_date > start_date),
    check ((status in ('draft', 'active')) = (ended_at is null))
);
create unique index paths_one_open_idx on learning.paths (learner_id) where status in ('draft', 'active');
create index paths_learner_idx on learning.paths (learner_id, created_at desc);

-- Les niveaux du parcours, dans l'ordre du cadre européen (A1 = 1 … C2 = 6), avec la version publiée retenue.
create table learning.path_steps (
    id uuid primary key default gen_random_uuid(),
    path_id uuid not null references learning.paths(id),
    rank integer not null check (rank between 1 and 6),
    level_code text not null check (level_code ~ '^[ABC][12]$'),
    track_version_id uuid not null,
    track_version_number integer not null check (track_version_number > 0),
    status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'withdrawn')),
    enrollment_id uuid unique references learning.enrollments(id),
    activated_at timestamptz,
    completed_at timestamptz,
    check (status in ('planned', 'withdrawn') or enrollment_id is not null)
);
create unique index path_steps_rank_idx on learning.path_steps (path_id, rank) where status <> 'withdrawn';

-- Jours de travail en vigueur pour tout le parcours.
create table learning.path_availabilities (
    path_id uuid not null references learning.paths(id),
    weekday integer not null check (weekday between 1 and 7),
    sessions integer not null check (sessions between 1 and 6),
    minutes integer not null check (minutes between 10 and 240),
    primary key (path_id, weekday)
);

-- Révisions numérotées du planning global ; une seule proposition en attente à la fois.
create table learning.path_revisions (
    path_id uuid not null references learning.paths(id),
    number integer not null check (number > 0),
    base_revision integer not null check (base_revision >= 0),
    status text not null default 'proposed' check (status in ('proposed', 'validated', 'superseded', 'discarded')),
    start_date date not null,
    target_date date not null,
    availability jsonb not null check (jsonb_typeof(availability) = 'array'),
    plan jsonb not null check (jsonb_typeof(plan) = 'object'),
    capacity_minutes integer not null check (capacity_minutes >= 0),
    required_minutes integer not null check (required_minutes >= 0),
    overflow_count integer not null default 0 check (overflow_count >= 0),
    difficulty text not null,
    created_by uuid not null,
    created_at timestamptz not null default now(),
    validated_by uuid,
    validated_at timestamptz,
    primary key (path_id, number)
);
create unique index path_revisions_one_proposed_idx on learning.path_revisions (path_id) where status = 'proposed';

-- Contrat numéroté : au plus une proposition en attente et un contrat en vigueur par parcours.
create table learning.contracts (
    path_id uuid not null references learning.paths(id),
    number integer not null check (number > 0),
    status text not null
        check (status in ('pending_teacher', 'pending_learner', 'accepted', 'rejected', 'superseded', 'withdrawn')),
    proposed_by text not null check (proposed_by in ('learner', 'teacher', 'admin', 'system')),
    proposer_id uuid,
    start_level text not null check (start_level ~ '^(A0|[ABC][12])$'),
    target_level text not null check (target_level ~ '^[ABC][12]$'),
    start_date date not null,
    target_date date not null,
    weekly_minutes integer not null check (weekly_minutes between 0 and 5040),
    availability jsonb not null default '[]' check (jsonb_typeof(availability) = 'array'),
    required_minutes integer not null check (required_minutes >= 0),
    difficulty text not null,
    note text check (length(note) <= 1000),
    created_at timestamptz not null default now(),
    decided_at timestamptz,
    decided_by uuid,
    decision_note text check (length(decision_note) <= 1000),
    primary key (path_id, number),
    check (target_date > start_date)
);
create unique index contracts_one_pending_idx on learning.contracts (path_id)
    where status in ('pending_teacher', 'pending_learner');
create unique index contracts_one_accepted_idx on learning.contracts (path_id) where status = 'accepted';

-- Cours ajoutés par le professeur : un module ou une activité de n'importe quelle version publiée de la langue.
create table learning.path_additions (
    id uuid primary key default gen_random_uuid(),
    path_id uuid not null references learning.paths(id),
    step_id uuid not null references learning.path_steps(id),
    source_version_id uuid not null,
    source_level_code text not null check (source_level_code ~ '^[ABC][12]$'),
    module_id text not null check (module_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    activity_id text check (activity_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    title text not null check (length(title) between 1 and 160),
    minutes integer not null check (minutes between 1 and 2000),
    placement text not null check (placement in ('next', 'end_of_level')),
    note text check (length(note) <= 500),
    added_by uuid not null,
    added_at timestamptz not null default now(),
    removed_at timestamptz,
    removed_by uuid
);
create index path_additions_path_idx on learning.path_additions (path_id) where removed_at is null;

-- Une activité ajoutée porte sa version source : le contenu est lu dans cette version.
alter table learning.session_activities
    add column source_version_id uuid,
    add column source_activity_id text check (source_activity_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    add column addition_id uuid,
    add constraint session_activities_source_check check ((source_version_id is null) = (source_activity_id is null));

-- Nouveaux sujets d'événements : parcours et contrat. Le nom de la contrainte est généré par Postgres.
alter table learning.outbox_events drop constraint if exists outbox_events_subject_kind_check;
alter table learning.outbox_events add constraint outbox_events_subject_kind_check
    check (subject_kind in ('goal', 'plan_revision', 'session', 'path', 'contract'));

-- --- Reprise des parcours en cours ---------------------------------------------------------------------------
-- Chaque inscription active devient un parcours d'un niveau (origine « migration ») avec un contrat accepté.
-- Les inscriptions ne sont pas modifiées. La jointure se fait sur l'élève, unique parmi les inscriptions actives.

create function learning.path_difficulty(required integer, start_date date, target_date date) returns text
    language sql immutable
    set search_path = ''
as $$
    select case
        when target_date - start_date < 7 then 'unrealistic'
        when ceil(required / ((target_date - start_date) / 7.0)) <= 150 then 'light'
        when ceil(required / ((target_date - start_date) / 7.0)) <= 300 then 'moderate'
        when ceil(required / ((target_date - start_date) / 7.0)) <= 450 then 'sustained'
        when ceil(required / ((target_date - start_date) / 7.0)) <= 630 then 'intensive'
        when ceil(required / ((target_date - start_date) / 7.0)) <= 840 then 'very_intensive'
        else 'unrealistic'
    end
$$;

with active as (
    select e.id, e.learner_id, e.level_code, e.track_version_id, e.track_version_number, e.assigned_by, e.assigned_at,
           e.start_level, e.start_date, e.goal_status, e.paused_at, e.resume_date, e.validated_revision,
           greatest(coalesce(e.target_date, e.start_date + 90), e.start_date + 1) as target_date,
           greatest(coalesce(e.initial_target_date, e.target_date, e.start_date + 90), e.start_date + 1) as initial_target_date,
           coalesce((select l.language_id from catalogue.track_versions v join catalogue.levels l on l.id = v.level_id
                     where v.id = e.track_version_id), 'de') as language_id,
           coalesce((select sum(a.sessions * a.minutes) from learning.availabilities a where a.enrollment_id = e.id), 0)
               as capacity,
           coalesce((select r.required_minutes from learning.plan_revisions r
                     where r.enrollment_id = e.id and r.status in ('validated', 'proposed')
                     order by (r.status = 'validated') desc, r.number desc limit 1), 0) as required
    from learning.enrollments e
    where e.status = 'active'
      and not exists (select 1 from learning.path_steps s where s.enrollment_id = e.id)
      and not exists (select 1 from learning.paths p where p.learner_id = e.learner_id and p.status in ('draft', 'active'))
), created as (
    insert into learning.paths (learner_id, language_id, status, start_level, target_level, start_date, target_date,
                                initial_target_date, weekly_minutes, required_minutes, difficulty, origin,
                                validated_revision, availability_confirmed_at, paused_at, resume_date, created_by,
                                created_at)
    select a.learner_id, case when a.language_id ~ '^[a-z]{2}$' then a.language_id else 'de' end, 'active',
           a.start_level, a.level_code, a.start_date, a.target_date, a.initial_target_date,
           least(5040, a.capacity, ceil(a.required / greatest((a.target_date - a.start_date) / 7.0, 1))::integer),
           a.required, learning.path_difficulty(a.required, a.start_date, a.target_date), 'migration',
           a.validated_revision, a.assigned_at, case when a.goal_status = 'paused' then a.paused_at end,
           case when a.goal_status = 'paused' then a.resume_date end, a.assigned_by, a.assigned_at
    from active a
    returning id, learner_id
)
insert into learning.path_steps (path_id, rank, level_code, track_version_id, track_version_number, status,
                                 enrollment_id, activated_at)
select c.id, array_position(array['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], a.level_code), a.level_code,
       a.track_version_id, a.track_version_number, 'active', a.id, a.assigned_at
from created c join active a on a.learner_id = c.learner_id;

insert into learning.path_availabilities (path_id, weekday, sessions, minutes)
select s.path_id, a.weekday, a.sessions, a.minutes
from learning.path_steps s
join learning.paths p on p.id = s.path_id and p.origin = 'migration'
join learning.availabilities a on a.enrollment_id = s.enrollment_id
on conflict do nothing;

-- Mêmes numéros et même révision de base : la numérotation lue par Suivi reste croissante.
insert into learning.path_revisions (path_id, number, base_revision, status, start_date, target_date, availability,
                                     plan, capacity_minutes, required_minutes, overflow_count, difficulty, created_by,
                                     created_at, validated_by, validated_at)
select s.path_id, r.number, r.base_revision, r.status, r.start_date, r.target_date, r.availability, r.plan,
       r.capacity_minutes, r.required_minutes, r.overflow_count,
       learning.path_difficulty(r.required_minutes, r.start_date, greatest(r.target_date, r.start_date)),
       r.created_by, r.created_at, r.validated_by, r.validated_at
from learning.path_steps s
join learning.paths p on p.id = s.path_id and p.origin = 'migration'
join learning.plan_revisions r on r.enrollment_id = s.enrollment_id and r.status in ('validated', 'proposed')
on conflict do nothing;

insert into learning.contracts (path_id, number, status, proposed_by, proposer_id, start_level, target_level,
                                start_date, target_date, weekly_minutes, availability, required_minutes, difficulty,
                                note, created_at, decided_at, decided_by)
select p.id, 1, 'accepted', 'system', null, p.start_level, p.target_level, p.start_date, p.target_date,
       p.weekly_minutes,
       coalesce((select jsonb_agg(jsonb_build_object('weekday', a.weekday, 'sessions', a.sessions,
                                                     'minutes', a.minutes) order by a.weekday)
                 from learning.path_availabilities a where a.path_id = p.id), '[]'::jsonb),
       p.required_minutes, p.difficulty,
       'Parcours en cours repris lors du passage aux parcours multi-niveaux.', now(), now(), null
from learning.paths p
where p.origin = 'migration' and not exists (select 1 from learning.contracts c where c.path_id = p.id);

drop function learning.path_difficulty(integer, date, date);

revoke all on learning.paths, learning.path_steps, learning.path_availabilities, learning.path_revisions,
    learning.contracts, learning.path_additions from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_learning') then
        grant select, insert, update on learning.paths, learning.path_steps, learning.path_revisions,
            learning.contracts, learning.path_additions to lingua_learning;
        grant select, insert, update, delete on learning.path_availabilities to lingua_learning;
    end if;
end;
$$;
