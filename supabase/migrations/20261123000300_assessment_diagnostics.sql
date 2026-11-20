-- Incrément 4 · diagnostic initial : résultat par module transmis à Apprentissage (DEV-036, DEV-037).
alter table assessment.quiz_attempts
    add column kind text not null default 'quiz' check (kind in ('quiz', 'diagnostic')),
    add column module_scores jsonb check (module_scores is null or jsonb_typeof(module_scores) = 'object');
