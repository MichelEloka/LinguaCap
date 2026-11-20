-- Incrément 3 · parcours attribués, séances et progression (DEV-028, DEV-029, DEV-031).

-- Une inscription référence la version du parcours utilisée au démarrage. Un seul parcours actif par élève.
create table learning.enrollments (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    level_code text not null check (level_code ~ '^[ABC][12]$'),
    track_version_id uuid not null,
    track_version_number integer not null check (track_version_number > 0),
    assigned_by uuid not null,
    assigned_at timestamptz not null default now(),
    status text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
    ended_at timestamptz,
    check ((status = 'active') = (ended_at is null))
);
create unique index enrollments_one_active_idx on learning.enrollments (learner_id) where status = 'active';
create index enrollments_learner_idx on learning.enrollments (learner_id, assigned_at desc);

-- Chaque séance a sa propre échéance et son propre état, même lorsque la journée en compte plusieurs.
create table learning.sessions (
    id uuid primary key default gen_random_uuid(),
    enrollment_id uuid not null references learning.enrollments(id),
    learner_id uuid not null,
    position integer not null check (position > 0),
    module_id text not null,
    title text not null,
    due_at timestamptz not null,
    created_at timestamptz not null default now(),
    started_at timestamptz,
    completed_at timestamptz,
    unique (enrollment_id, position),
    check (completed_at is null or started_at is not null)
);
create index sessions_learner_due_idx on learning.sessions (learner_id, due_at);

create table learning.session_activities (
    session_id uuid not null references learning.sessions(id),
    activity_id text not null,
    position integer not null check (position > 0),
    kind text not null check (kind in ('lesson', 'exercise', 'review', 'assessment')),
    title text not null,
    estimated_minutes integer not null check (estimated_minutes > 0),
    primary key (session_id, activity_id),
    unique (session_id, position)
);

-- Progression d'une activité : l'état sauvegardé permet la reprise, la fin n'est horodatée qu'une fois.
create table learning.activity_progress (
    session_id uuid not null,
    activity_id text not null,
    learner_id uuid not null,
    state jsonb not null default '{}' check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 8192),
    started_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    completed_at timestamptz,
    attempt_id uuid,
    primary key (session_id, activity_id),
    foreign key (session_id, activity_id) references learning.session_activities(session_id, activity_id)
);

revoke all on learning.enrollments, learning.sessions, learning.session_activities, learning.activity_progress
    from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_learning') then
        grant select, insert, update on learning.enrollments, learning.sessions,
            learning.session_activities, learning.activity_progress to lingua_learning;
    end if;
end;
$$;
