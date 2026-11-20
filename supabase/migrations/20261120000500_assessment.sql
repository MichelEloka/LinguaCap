CREATE SCHEMA IF NOT EXISTS assessment;
REVOKE ALL ON SCHEMA assessment FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS assessment.quiz_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id uuid NOT NULL,
    lesson_id text NOT NULL CHECK (lesson_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    answers jsonb NOT NULL CHECK (jsonb_typeof(answers) = 'object'),
    correct integer NOT NULL CHECK (correct >= 0),
    total integer NOT NULL CHECK (total > 0 AND correct <= total),
    request_key text,
    submitted_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (learner_id, request_key)
);
CREATE INDEX IF NOT EXISTS quiz_attempts_learner_submitted_idx
    ON assessment.quiz_attempts (learner_id, submitted_at DESC, id);
REVOKE ALL ON assessment.quiz_attempts FROM PUBLIC, anon, authenticated;
