-- Incrément 4 · objectif, disponibilités, propositions de planning et replanification (DEV-034 à DEV-045).
-- Compatible avec la version précédente du service pendant le déploiement : colonnes avec valeurs par défaut,
-- et un déclencheur complète le parcours d'une progression écrite par l'ancienne version.

-- L'objectif est porté par le parcours attribué.
alter table learning.enrollments
    add column start_level text not null default 'A0' check (start_level ~ '^(A0|[ABC][12])$'),
    add column start_date date not null default current_date,
    add column target_date date,
    add column initial_target_date date,
    add column template text not null default 'standard' check (template in ('standard', 'intensive', 'custom')),
    add column goal_status text not null default 'active'
        check (goal_status in ('preparing', 'active', 'paused', 'awaiting_assessment', 'awaiting_grading',
                               'validated', 'to_consolidate')),
    add column paused_at timestamptz,
    add column resume_date date,
    add column prerequisite_level text check (prerequisite_level ~ '^[ABC][12]$'),
    add column prerequisite_met boolean not null default true,
    add column acquired_modules text[] not null default '{}',
    add column diagnostic_attempt_id uuid,
    add column diagnostic_modules text[],
    add column diagnostic_prerequisite boolean,
    add column starting_point_confirmed_at timestamptz,
    add column starting_point_confirmed_by uuid,
    add column validated_revision integer not null default 0 check (validated_revision >= 0),
    add constraint enrollments_dates_check check (target_date is null or target_date >= start_date),
    add constraint enrollments_pause_check check ((goal_status = 'paused') = (paused_at is not null));

-- Disponibilités : par jour de la semaine, un nombre de séances et une durée par séance.
create table learning.availabilities (
    enrollment_id uuid not null references learning.enrollments(id),
    weekday integer not null check (weekday between 1 and 7),
    sessions integer not null check (sessions between 1 and 6),
    minutes integer not null check (minutes between 10 and 240),
    primary key (enrollment_id, weekday)
);

-- Chaque proposition est une révision numérotée. Elle se valide seulement si le planning n'a pas changé depuis.
create table learning.plan_revisions (
    enrollment_id uuid not null references learning.enrollments(id),
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
    created_by uuid not null,
    created_at timestamptz not null default now(),
    validated_by uuid,
    validated_at timestamptz,
    primary key (enrollment_id, number)
);
create unique index plan_revisions_one_proposed_idx on learning.plan_revisions (enrollment_id) where status = 'proposed';

-- Séances : date planifiée, créneau du jour et révision d'origine. Une séance remplacée reste dans l'historique.
alter table learning.sessions
    add column scheduled_date date,
    add column slot integer not null default 1 check (slot between 1 and 6),
    add column revision_number integer not null default 0 check (revision_number >= 0),
    add column superseded_at timestamptz;
update learning.sessions set scheduled_date = (due_at at time zone 'Europe/Paris')::date;

create table learning.session_due_history (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references learning.sessions(id),
    revision_number integer not null,
    previous_due_at timestamptz not null,
    was_late boolean not null,
    reason text not null check (reason in ('replanned', 'paused')),
    changed_at timestamptz not null default now()
);
create index session_due_history_session_idx on learning.session_due_history (session_id);

-- La progression appartient au parcours : elle survit au remplacement d'une séance par une replanification.
alter table learning.activity_progress drop constraint activity_progress_session_id_activity_id_fkey;
alter table learning.activity_progress add column enrollment_id uuid references learning.enrollments(id);
update learning.activity_progress p set enrollment_id = s.enrollment_id
  from learning.sessions s where s.id = p.session_id;

create function learning.fill_progress_enrollment() returns trigger
    language plpgsql
    set search_path = ''
as $$
begin
    if new.enrollment_id is null then
        select enrollment_id into new.enrollment_id from learning.sessions where id = new.session_id;
    end if;
    return new;
end;
$$;
create trigger activity_progress_enrollment before insert on learning.activity_progress
    for each row execute function learning.fill_progress_enrollment();

alter table learning.activity_progress alter column enrollment_id set not null;
create unique index activity_progress_enrollment_activity_idx on learning.activity_progress (enrollment_id, activity_id);

revoke all on learning.availabilities, learning.plan_revisions, learning.session_due_history from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_learning') then
        grant select, insert, update, delete on learning.availabilities to lingua_learning;
        grant select, insert, update on learning.plan_revisions, learning.session_due_history to lingua_learning;
    end if;
end;
$$;
