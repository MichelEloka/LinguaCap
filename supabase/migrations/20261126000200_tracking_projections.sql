-- Incrément 7 · projections de Suivi, alertes et traitement périodique (DEV-075 à DEV-082).

-- Journal des événements reçus : la clé de l'événement déduplique, le journal permet de reconstruire les projections.
create table tracking.event_log (
    event_id uuid primary key,
    producer text not null check (producer in ('identity', 'learning', 'assessment')),
    sequence bigint not null,
    type text not null,
    occurred_at timestamptz not null,
    learner_id uuid,
    subject_kind text not null,
    subject_id text not null,
    data jsonb not null,
    received_at timestamptz not null default now(),
    unique (producer, sequence)
);
create index event_log_replay_idx on tracking.event_log (occurred_at, producer, sequence);

-- Point de reprise par producteur : un lot interrompu est relu à partir du dernier numéro confirmé.
create table tracking.checkpoints (
    producer text primary key check (producer in ('identity', 'learning', 'assessment')),
    last_sequence bigint not null default 0,
    updated_at timestamptz not null default now(),
    failures integer not null default 0,
    last_error text
);
insert into tracking.checkpoints (producer) values ('identity'), ('learning'), ('assessment');

-- Synthèse d'un objectif : état, échéances, temps de pratique, séances et résultats par compétence.
create table tracking.goals (
    enrollment_id uuid primary key,
    learner_id uuid not null,
    level_code text,
    start_level text,
    template text,
    accompanied boolean,
    goal_status text not null default 'active',
    status_at timestamptz,
    target_date date,
    initial_target_date date,
    resume_date date,
    assigned_at timestamptz,
    last_activity_at timestamptz,
    practice_seconds bigint not null default 0,
    sessions_completed integer not null default 0,
    sessions_on_time integer not null default 0,
    pending_grading integer not null default 0,
    results jsonb not null default '{}' check (jsonb_typeof(results) = 'object'),
    updated_at timestamptz not null default now()
);
create index goals_learner_idx on tracking.goals (learner_id);

create table tracking.sessions (
    session_id uuid primary key,
    enrollment_id uuid not null,
    learner_id uuid not null,
    revision integer not null,
    due_at timestamptz not null,
    completed_at timestamptz,
    milestone text check (milestone in ('midterm', 'final')),
    superseded boolean not null default false
);
create index sessions_enrollment_idx on tracking.sessions (enrollment_id) where not superseded;

-- Instants d'activité pédagogique, pour le temps de pratique et les élèves actifs.
create table tracking.activity (
    enrollment_id uuid not null,
    learner_id uuid not null,
    at timestamptz not null,
    event_id uuid not null references tracking.event_log(event_id),
    primary key (event_id)
);
create index activity_learner_idx on tracking.activity (learner_id, at);

-- Une alerte par objectif : ouverte, suspendue pendant une pause, puis close quand le risque disparaît.
create table tracking.alerts (
    id uuid primary key default gen_random_uuid(),
    enrollment_id uuid not null,
    learner_id uuid not null,
    status text not null default 'open' check (status in ('open', 'suspended', 'closed')),
    reason text not null,
    late_sessions integer not null default 0,
    next_milestone text,
    next_milestone_due_at timestamptz,
    midterm_overdue boolean not null default false,
    opened_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    closed_at timestamptz,
    encouraged_at timestamptz,
    check (status <> 'closed' or closed_at is not null)
);
create unique index alerts_one_active_idx on tracking.alerts (enrollment_id) where status <> 'closed';

-- Un encouragement peut répondre à une alerte ; la première activité qui suit marque la reprise.
alter table tracking.encouragements
    add column alert_id uuid references tracking.alerts(id),
    add column enrollment_id uuid,
    add column resumed_at timestamptz;

create table tracking.job_runs (
    id uuid primary key default gen_random_uuid(),
    kind text not null check (kind in ('sync', 'rebuild')),
    started_at timestamptz not null default now(),
    finished_at timestamptz,
    imported integer not null default 0,
    alerts_opened integer not null default 0,
    alerts_updated integer not null default 0,
    alerts_closed integer not null default 0,
    status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
    error text
);

revoke all on tracking.event_log, tracking.checkpoints, tracking.goals, tracking.sessions, tracking.activity,
    tracking.alerts, tracking.job_runs from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_tracking') then
        grant select, insert, update, delete on tracking.event_log, tracking.checkpoints, tracking.goals,
            tracking.sessions, tracking.activity, tracking.alerts, tracking.job_runs to lingua_tracking;
    end if;
end;
$$;
