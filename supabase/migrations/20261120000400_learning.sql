CREATE SCHEMA IF NOT EXISTS learning;
REVOKE ALL ON SCHEMA learning FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS learning.goal_plans (
    learner_id uuid PRIMARY KEY,
    level text NOT NULL CHECK (level IN ('A1', 'A2')),
    pace text NOT NULL CHECK (pace IN ('standard', 'intensive')),
    start_date date NOT NULL,
    target_date date NOT NULL CHECK (target_date >= start_date),
    study_days integer[] NOT NULL CHECK (
        cardinality(study_days) BETWEEN 1 AND 7 AND study_days <@ ARRAY[1, 2, 3, 4, 5, 6, 7]
    ),
    sessions_per_day integer NOT NULL CHECK (sessions_per_day BETWEEN 1 AND 1440),
    minutes_per_session integer NOT NULL CHECK (
        minutes_per_session BETWEEN 1 AND 1440 AND minutes_per_session * sessions_per_day <= 1440
    ),
    updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON learning.goal_plans FROM PUBLIC, anon, authenticated;
