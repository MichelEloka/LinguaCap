-- Incrément 4 · données de planification du catalogue (DEV-034, DEV-036, DEV-037, DEV-040).
-- Prérequis entre niveaux, critères de réussite, durées des révisions et évaluations, diagnostic par version.

alter table catalogue.levels add column prerequisite_level_id text references catalogue.levels(id);
update catalogue.levels set prerequisite_level_id = 'a1' where id = 'a2';
update catalogue.levels set prerequisite_level_id = 'a2' where id = 'b1';

-- Question de diagnostic : elle situe l'élève sur un module (ou sur le prérequis du niveau).
alter table catalogue.questions add column module_ref text check (module_ref ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table catalogue.track_versions
    add column expected_competences text[] not null default '{}',
    add column success_criteria text not null default '',
    add column pass_percent integer not null default 60 check (pass_percent between 1 and 100),
    add column review_minutes integer not null default 10 check (review_minutes between 0 and 120),
    add column midterm_minutes integer not null default 30 check (midterm_minutes between 0 and 240),
    add column final_minutes integer not null default 60 check (final_minutes between 0 and 300),
    add column diagnostic_lesson_id text references catalogue.lessons(id);

-- Diagnostics de démonstration : une question par module, et le prérequis A1 pour le parcours A2.
insert into catalogue.lessons (id, level_id, title, description, transcript, media_ids) values
    ('diagnostic-a1', 'a1', 'Diagnostic A1', 'Quelques questions pour situer votre point de départ.', '', '{}'),
    ('diagnostic-a2', 'a2', 'Diagnostic A2', 'Vérifiez vos acquis A1 et situez votre point de départ en A2.', '', '{}'),
    ('ma-journee', 'a2', 'Raconter sa journée',
     'Comprenez une courte description de journée et repérez les moments clés.',
     'Ich stehe um sieben Uhr auf. Dann frühstücke ich und fahre mit dem Bus zur Arbeit.', '{}');

insert into catalogue.questions (lesson_id, id, position, prompt, module_ref) values
    ('diagnostic-a1', 'diag-cafe-1', 1, 'Que signifie « Ich möchte einen Kaffee, bitte » ?', 'au-cafe'),
    ('diagnostic-a1', 'diag-cafe-2', 2, 'Quelle formule est polie pour commander ?', 'au-cafe'),
    ('diagnostic-a2', 'diag-prerequis', 1, 'Que signifie « Ich möchte einen Kaffee, bitte » ?', 'prerequis'),
    ('diagnostic-a2', 'diag-journee', 2, 'Que signifie « Ich stehe um sieben Uhr auf » ?', 'ma-journee'),
    ('ma-journee', 'journee-question', 1, 'Comment la personne va-t-elle au travail ?', null);

insert into catalogue.options (lesson_id, question_id, id, position, label, correct) values
    ('diagnostic-a1', 'diag-cafe-1', 'cafe', 1, 'Je voudrais un café, s’il vous plaît.', true),
    ('diagnostic-a1', 'diag-cafe-1', 'eau', 2, 'Je bois de l’eau tous les jours.', false),
    ('diagnostic-a1', 'diag-cafe-2', 'bitte', 1, 'Einen Tee, bitte.', true),
    ('diagnostic-a1', 'diag-cafe-2', 'tee', 2, 'Tee!', false),
    ('diagnostic-a2', 'diag-prerequis', 'cafe', 1, 'Je voudrais un café, s’il vous plaît.', true),
    ('diagnostic-a2', 'diag-prerequis', 'eau', 2, 'Je bois de l’eau tous les jours.', false),
    ('diagnostic-a2', 'diag-journee', 'sept', 1, 'Je me lève à sept heures.', true),
    ('diagnostic-a2', 'diag-journee', 'soir', 2, 'Je me couche à sept heures.', false),
    ('ma-journee', 'journee-question', 'bus', 1, 'En bus', true),
    ('ma-journee', 'journee-question', 'velo', 2, 'À vélo', false),
    ('ma-journee', 'journee-question', 'pied', 3, 'À pied', false);

update catalogue.track_versions
   set expected_competences = array['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'],
       success_criteria = 'Atteindre 60 % aux réponses fermées de l’examen blanc et obtenir une appréciation favorable '
           || 'à l’écrit et à l’oral selon la grille du parcours.',
       diagnostic_lesson_id = 'diagnostic-a1'
 where id = 'a1000000-0000-4000-8000-000000000001';

-- Parcours A2 de démonstration (le contenu complet arrive avec l'intégration pédagogique) : prérequis A1.
insert into catalogue.track_versions (id, level_id, number, expected_competences, success_criteria, diagnostic_lesson_id)
values ('a2000000-0000-4000-8000-000000000001', 'a2', 1,
        array['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'],
        'Atteindre 60 % aux réponses fermées de l’examen blanc et obtenir une appréciation favorable '
            || 'à l’écrit et à l’oral selon la grille du parcours.',
        'diagnostic-a2');
insert into catalogue.modules (version_id, id, position, title, objective) values
    ('a2000000-0000-4000-8000-000000000001', 'ma-journee', 1, 'Ma journée',
     'Comprendre et décrire simplement les moments d’une journée ordinaire.');
insert into catalogue.activities
    (version_id, id, module_id, position, kind, title, estimated_minutes, competences, lesson_id)
values
    ('a2000000-0000-4000-8000-000000000001', 'raconter-sa-journee', 'ma-journee', 1, 'lesson',
     'Raconter sa journée', 15, array['lecture', 'ecoute'], 'ma-journee'),
    ('a2000000-0000-4000-8000-000000000001', 'quiz-la-journee', 'ma-journee', 2, 'exercise',
     'Exercice : la journée', 5, array['lecture'], 'ma-journee');
update catalogue.track_versions set status = 'published', published_at = now()
 where id = 'a2000000-0000-4000-8000-000000000001';
