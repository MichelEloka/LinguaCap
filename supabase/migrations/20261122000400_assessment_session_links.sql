-- Incrément 3 · une tentative de quiz peut être rattachée à la séance et à l'activité qui l'ont produite (DEV-028).
alter table assessment.quiz_attempts
    add column session_id uuid,
    add column activity_id text check (activity_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    add constraint quiz_attempts_activity_check check ((session_id is null) = (activity_id is null));
create index quiz_attempts_session_idx on assessment.quiz_attempts (session_id) where session_id is not null;
