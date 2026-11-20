-- Incrément 7 · événements métier des services producteurs (DEV-073, DEV-074).
-- Chaque producteur écrit ses événements dans sa table de sortie, dans la transaction de l'action métier.
-- La séquence ordonne la lecture par Suivi, qui reprend après le dernier numéro traité.

alter table identity.outbox_events add column sequence bigint generated always as identity;
create unique index outbox_events_sequence_idx on identity.outbox_events (sequence);

create table learning.outbox_events (
    id uuid primary key,
    sequence bigint generated always as identity unique,
    type text not null check (type ~ '^learning\.[a-z_]+$'),
    version integer not null default 1 check (version > 0),
    occurred_at timestamptz not null default now(),
    subject_kind text not null check (subject_kind in ('goal', 'plan_revision', 'session')),
    subject_id text not null,
    learner_id uuid not null,
    request_id text,
    data jsonb not null default '{}' check (jsonb_typeof(data) = 'object')
);
revoke all on learning.outbox_events from public, anon, authenticated;

create table assessment.outbox_events (
    id uuid primary key,
    sequence bigint generated always as identity unique,
    type text not null check (type ~ '^assessment\.[a-z_]+$'),
    version integer not null default 1 check (version > 0),
    occurred_at timestamptz not null default now(),
    subject_kind text not null check (subject_kind in ('attempt', 'grading')),
    subject_id text not null,
    learner_id uuid not null,
    request_id text,
    data jsonb not null default '{}' check (jsonb_typeof(data) = 'object')
);
revoke all on assessment.outbox_events from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_learning') then
        grant select, insert on learning.outbox_events to lingua_learning;
    end if;
    if exists (select 1 from pg_roles where rolname = 'lingua_assessment') then
        grant select, insert on assessment.outbox_events to lingua_assessment;
    end if;
end;
$$;
