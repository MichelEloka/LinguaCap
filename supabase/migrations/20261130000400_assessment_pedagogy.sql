-- V4 « Contenus et pédagogie » · Évaluations : exercices typés corrigés question par question, répétitions orales
-- validées, missions remises au professeur (EVO-043, EVO-044). Migration additive : l'ancienne version du service
-- continue de fonctionner (les colonnes ajoutées ont toutes une valeur par défaut).

-- Remise d'exercice : correction figée question par question (review), questions en attente de validation par le
-- professeur (pending), questions « à revoir » (flagged), manche (round_id) et remise par la route typée (typed).
alter table assessment.quiz_attempts
    add column review jsonb check (review is null or jsonb_typeof(review) = 'array'),
    add column pending integer not null default 0 check (pending >= 0),
    add column flagged text[] not null default '{}',
    add column round_id uuid,
    add column typed boolean not null default false,
    -- Nom distinct de quiz_attempts_pending_check, déjà pris par le contrôle de la colonne pending.
    add constraint quiz_attempts_pending_total_check check (correct + pending <= total);
-- Une manche se remet une fois : rejouer la remise renvoie la même correction, « Refaire » ouvre une nouvelle manche.
create unique index quiz_attempts_round_idx on assessment.quiz_attempts (learner_id, round_id) where round_id is not null;

-- Répétition orale : chaque essai reconnu par le navigateur est rescoré ici à partir du texte reconnu. Sans
-- reconnaissance vocale, l'élève enregistre sa voix (mode recording) et le professeur valide ou refuse l'essai.
create table assessment.speech_attempts (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    lesson_id text not null check (lesson_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    question_id text not null check (question_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    round_id uuid not null,
    session_id uuid,
    activity_id text,
    attempt integer not null check (attempt between 1 and 20),
    mode text not null check (mode in ('recognition', 'recording')),
    transcript text check (length(transcript) <= 300),
    score integer check (score between 0 and 100),
    threshold integer not null check (threshold between 50 and 100),
    passed boolean not null default false,
    production_id uuid,
    recording_mime text check (length(recording_mime) <= 100),
    review_status text not null default 'auto'
        check (review_status in ('auto', 'uploading', 'pending', 'validated', 'rejected')),
    reviewer_id uuid,
    reviewed_at timestamptz,
    comment text check (length(comment) <= 1000),
    quiz_attempt_id uuid references assessment.quiz_attempts(id),
    created_at timestamptz not null default now(),
    unique (learner_id, round_id, question_id, attempt),
    check ((session_id is null) = (activity_id is null)),
    check (mode = 'recording' or (transcript is not null and score is not null))
);
create index speech_attempts_pending_idx on assessment.speech_attempts (created_at) where review_status = 'pending';
revoke all on assessment.speech_attempts from public, anon, authenticated;

-- Mission : remise orale et/ou écrite avec sa liste d'auto-vérification, envoyée au professeur référent ou au
-- correcteur désigné (submitted), ou simplement envoyée sans destinataire (sent) ; retour validated ou to_redo.
create table assessment.mission_submissions (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    track_version_id uuid not null,
    level_code text not null check (level_code ~ '^[ABC][12]$'),
    module_id text not null,
    activity_id text not null,
    lesson_id text not null,
    session_id uuid,
    session_activity_id text,
    number integer not null check (number > 0),
    status text not null default 'draft' check (status in ('draft', 'submitted', 'sent', 'reviewed')),
    definition jsonb not null check (jsonb_typeof(definition) = 'object'),
    text text not null default '' check (length(text) <= 1500),
    checklist integer[] not null default '{}',
    recording_id uuid,
    recording_mime text check (length(recording_mime) <= 100),
    reviewer_id uuid,
    reviewer_kind text check (reviewer_kind in ('teacher', 'reviewer')),
    submit_key text check (submit_key ~ '^[A-Za-z0-9_-]{8,128}$'),
    submitted_at timestamptz,
    decision text check (decision in ('validated', 'to_redo')),
    comment text check (length(comment) <= 2000),
    reviewed_by uuid,
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (learner_id, track_version_id, activity_id, number),
    check ((session_id is null) = (session_activity_id is null)),
    check ((status = 'draft') = (submitted_at is null)),
    check ((status = 'reviewed') = (decision is not null and reviewed_at is not null))
);
-- Un seul brouillon par mission et par élève : rouvrir la mission reprend le brouillon.
create unique index mission_submissions_draft_idx on assessment.mission_submissions (learner_id, track_version_id, activity_id)
    where status = 'draft';
create index mission_submissions_queue_idx on assessment.mission_submissions (submitted_at) where status = 'submitted';
create index mission_submissions_learner_idx on assessment.mission_submissions (learner_id, created_at desc);
revoke all on assessment.mission_submissions from public, anon, authenticated;

-- Nouveaux sujets d'événements : assessment.exercise_flagged (exercise), assessment.mission_submitted et
-- assessment.mission_reviewed (mission). Sans clé enrollmentId : Suivi les ignore aujourd'hui.
alter table assessment.outbox_events drop constraint outbox_events_subject_kind_check,
    add constraint outbox_events_subject_kind_check
        check (subject_kind in ('attempt', 'grading', 'exercise', 'mission'));

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_assessment') then
        -- La validation d'un enregistrement par le professeur met à jour la remise de l'exercice.
        grant update on assessment.quiz_attempts to lingua_assessment;
        grant select, insert, update on assessment.speech_attempts, assessment.mission_submissions to lingua_assessment;
    end if;
end;
$$;
