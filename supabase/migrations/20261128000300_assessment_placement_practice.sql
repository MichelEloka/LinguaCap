-- Incrément « Parcours » · test de niveau et examens d'entraînement (Évaluations).
-- Migration additive : les tables existantes ne changent pas, l'ancienne version du service continue de fonctionner.

-- Test de niveau : une tentative fige au démarrage le tirage de tous les paliers, corrigés compris (definition),
-- ce qui rend la reprise stable. L'élève passe un palier à la fois ; le test s'arrête au premier palier échoué.
-- « Débutant déclaré » : tentative terminée d'office au niveau A0, sans banque ni questions (test_id null).
create table assessment.placement_attempts (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    language_id text not null check (language_id ~ '^[a-z]{2}$'),
    test_id uuid,
    test_number integer check (test_number > 0),
    status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
    definition jsonb not null default '{}' check (jsonb_typeof(definition) = 'object'),
    current_tier text check (current_tier ~ '^[ABC][12]$'),
    -- Réponses enregistrées en cours de palier, puis réponses remises : {palier: {question: choix}}.
    saved_answers jsonb not null default '{}' check (jsonb_typeof(saved_answers) = 'object'),
    answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object'),
    tier_results jsonb not null default '{}' check (jsonb_typeof(tier_results) = 'object'),
    -- Clés de remise déjà traitées : rejouer une remise renvoie le même état sans la compter deux fois.
    submit_keys jsonb not null default '{}' check (jsonb_typeof(submit_keys) = 'object'),
    declared_beginner boolean not null default false,
    placed_level text check (placed_level ~ '^(A0|[ABC][12])$'),
    started_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    completed_at timestamptz,
    check ((status = 'completed') = (placed_level is not null and completed_at is not null)),
    check ((status = 'in_progress') = (current_tier is not null)),
    check (not declared_beginner or (status = 'completed' and placed_level = 'A0'))
);
-- Une seule tentative ouverte par élève et par langue : rouvrir le test reprend la tentative.
create unique index placement_attempts_open_idx on assessment.placement_attempts (learner_id, language_id)
    where status = 'in_progress';
create index placement_attempts_learner_idx on assessment.placement_attempts (learner_id, started_at desc);
revoke all on assessment.placement_attempts from public, anon, authenticated;

-- Examen d'entraînement en accès libre : définition figée de la version, parties fermées corrigées seulement.
-- Aucun lien avec le parcours, aucun événement, aucune file de correction. Seul le bilan intermédiaire est
-- proposé par le service (l'examen blanc reste l'examen de passage de niveau) ; la colonne kind garde les deux
-- valeurs pour les séries d'entraînement à venir.
create table assessment.practice_attempts (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    track_version_id uuid not null,
    level_code text not null check (level_code ~ '^[ABC][12]$'),
    kind text not null check (kind in ('midterm', 'final')),
    definition jsonb not null check (jsonb_typeof(definition) = 'object'),
    status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
    answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object'),
    submit_key text check (submit_key ~ '^[A-Za-z0-9_-]{8,128}$'),
    scores jsonb check (scores is null or jsonb_typeof(scores) = 'object'),
    percent integer check (percent between 0 and 100),
    started_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    submitted_at timestamptz,
    check ((status = 'submitted') = (submitted_at is not null))
);
-- Une seule tentative ouverte par version et par type : rouvrir l'entraînement le reprend.
create unique index practice_attempts_open_idx on assessment.practice_attempts (learner_id, track_version_id, kind)
    where status = 'in_progress';
create index practice_attempts_learner_idx on assessment.practice_attempts (learner_id, started_at desc);
revoke all on assessment.practice_attempts from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_assessment') then
        grant select, insert, update on assessment.placement_attempts, assessment.practice_attempts to lingua_assessment;
    end if;
end;
$$;
