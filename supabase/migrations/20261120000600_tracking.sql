CREATE SCHEMA IF NOT EXISTS tracking;
REVOKE ALL ON SCHEMA tracking FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS tracking.encouragements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id uuid NOT NULL,
    author_id uuid NOT NULL CHECK (author_id <> learner_id),
    text text NOT NULL CHECK (char_length(btrim(text)) BETWEEN 1 AND 500),
    sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS encouragements_learner_sent_idx
    ON tracking.encouragements (learner_id, sent_at DESC, id);
REVOKE ALL ON tracking.encouragements FROM PUBLIC, anon, authenticated;
