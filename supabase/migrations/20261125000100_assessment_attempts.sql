-- Incrément 6 · tentatives d'évaluation, remises, corrections et résultats par compétence (DEV-061 à DEV-071).

-- Une tentative fige la définition de l'évaluation (parties, questions, corrigés, grilles) de la version attribuée.
-- La date de remise et la date de correction sont distinctes : une remise à temps corrigée après l'échéance reste à temps.
create table assessment.exam_attempts (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    enrollment_id uuid not null,
    track_version_id uuid not null,
    kind text not null check (kind in ('midterm', 'final')),
    number integer not null check (number > 0),
    status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'graded')),
    definition jsonb not null check (jsonb_typeof(definition) = 'object'),
    pass_percent integer not null check (pass_percent between 1 and 100),
    answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object'),
    texts jsonb not null default '{}' check (jsonb_typeof(texts) = 'object'),
    recordings jsonb not null default '{}' check (jsonb_typeof(recordings) = 'object'),
    due_at timestamptz,
    started_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    submit_key text check (submit_key ~ '^[A-Za-z0-9_-]{8,128}$'),
    submitted_at timestamptz,
    graded_at timestamptz,
    grader_id uuid,
    grading jsonb check (grading is null or jsonb_typeof(grading) = 'object'),
    scores jsonb check (scores is null or jsonb_typeof(scores) = 'object'),
    percent integer check (percent between 0 and 100),
    decision text check (decision in ('validated', 'to_consolidate', 'completed')),
    review jsonb check (review is null or jsonb_typeof(review) = 'array'),
    feedback text check (length(feedback) <= 4000),
    unique (enrollment_id, kind, number),
    check (status = 'in_progress' or submitted_at is not null),
    check (status <> 'graded' or (graded_at is not null and decision is not null))
);
-- Une seule tentative ouverte par évaluation et par parcours : rouvrir la page reprend la tentative.
create unique index exam_attempts_open_idx on assessment.exam_attempts (enrollment_id, kind) where status = 'in_progress';
create index exam_attempts_learner_idx on assessment.exam_attempts (learner_id, started_at desc);
create index exam_attempts_grading_idx on assessment.exam_attempts (submitted_at) where status = 'submitted';
revoke all on assessment.exam_attempts from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_assessment') then
        grant select, insert, update on assessment.exam_attempts to lingua_assessment;
    end if;
end;
$$;
