-- Données fictives et reproductibles pour Supabase local (supabase start / supabase db reset).
-- Le catalogue A1/A2/B1 et ses médias sont fournis par les migrations.
-- Aucun compte Auth ni mot de passe n'est créé ici : ces profils servent aux tests et aux futurs calculs de KPI.
-- Les comptes de connexion de la recette sont créés à la volée par infra/pilot/smoke.mjs.
-- Ce fichier n'est jamais appliqué en production : le workflow de livraison utilise `supabase db push` sans --include-seed.

insert into identity.profiles (id, display_name, role, teacher_id) values
    ('00000000-0000-4000-8000-000000000001', 'Démo · Administratrice', 'admin', null),
    ('00000000-0000-4000-8000-000000000010', 'Démo · Marie Laurent', 'teacher', null),
    ('00000000-0000-4000-8000-000000000101', 'Démo · Alice Martin', 'learner', '00000000-0000-4000-8000-000000000010'),
    ('00000000-0000-4000-8000-000000000102', 'Démo · Thomas Dubois', 'learner', '00000000-0000-4000-8000-000000000010'),
    ('00000000-0000-4000-8000-000000000103', 'Démo · Lucas Bernard', 'learner', null)
on conflict (id) do nothing;

-- Alice : A1 intensif, deux séances par jour, quiz réussi.
-- Thomas : A1 standard, en retard, aucun résultat.
-- Lucas : élève autonome en A2.
insert into learning.goal_plans
    (learner_id, level, pace, start_date, target_date, study_days, sessions_per_day, minutes_per_session, updated_at)
values
    ('00000000-0000-4000-8000-000000000101', 'A1', 'intensive', '2026-11-02', '2026-12-02', array[1,2,3,4,5,6,7], 2, 45, '2026-11-02T08:00:00Z'),
    ('00000000-0000-4000-8000-000000000102', 'A1', 'standard', '2026-11-02', '2027-01-29', array[1,3,5], 1, 30, '2026-11-02T08:00:00Z'),
    ('00000000-0000-4000-8000-000000000103', 'A2', 'intensive', '2026-11-09', '2027-01-08', array[1,2,4,6], 2, 40, '2026-11-09T08:00:00Z')
on conflict (learner_id) do nothing;

insert into assessment.quiz_attempts (id, learner_id, lesson_id, answers, correct, total, request_key, submitted_at) values
    ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000101', 'commander-au-cafe',
     '{"cafe-question": "the"}', 0, 1, 'demo-alice-1', '2026-11-03T18:10:00Z'),
    ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000101', 'commander-au-cafe',
     '{"cafe-question": "cafe"}', 1, 1, 'demo-alice-2', '2026-11-04T18:05:00Z'),
    ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000103', 'commander-au-cafe',
     '{"cafe-question": "cafe"}', 1, 1, 'demo-lucas-1', '2026-11-10T07:30:00Z')
on conflict (id) do nothing;

insert into tracking.encouragements (id, learner_id, author_id, text, sent_at) values
    ('00000000-0000-4000-8000-000000002001', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000010',
     'Courage Thomas, une séance de 30 minutes aujourd’hui et tu rattrapes ton planning !', '2026-11-12T17:00:00Z')
on conflict (id) do nothing;
