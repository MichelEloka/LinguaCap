-- Contenus V4 et pédagogie · questions typées, explications, retours par choix, missions et vocabulaire des modules.
-- Additif : les questions existantes deviennent des questions « choice » (valeur par défaut), sans explication.
-- Les déclencheurs de gel (questions_frozen, options_frozen, activities_frozen, modules_frozen) sont des déclencheurs
-- de ligne : un ALTER TABLE ne les déclenche pas, les versions publiées restent intactes.
-- Droits : colonnes ajoutées à des tables déjà ouvertes à lingua_catalogue (SELECT, INSERT, UPDATE, DELETE) ; aucun
-- droit nouveau.

-- Type de question et clé de correction propre au type (servie à Évaluations seulement), explication du corrigé.
alter table catalogue.questions
    add column type text not null default 'choice'
        check (type in ('choice', 'fill', 'order', 'match', 'dictation', 'speak')),
    add column explanation text check (explanation is null or length(explanation) <= 1500),
    add column spec jsonb check (spec is null or (jsonb_typeof(spec) = 'object' and octet_length(spec::text) <= 8192));

-- Retour affiché après la remise quand l'élève a choisi cette réponse.
alter table catalogue.options add column feedback text check (feedback is null or length(feedback) <= 500);

-- Mission : production orale ou écrite remise dans l'application, avec sa liste de vérification.
-- La contrainte de forme est nommée : sans nom, Postgres appellerait la contrainte de colonne activities_mission_check,
-- nom réservé ici à la règle « seule une mission porte une mission ».
alter table catalogue.activities
    drop constraint activities_kind_check,
    add constraint activities_kind_check check (kind in ('lesson', 'exercise', 'review', 'assessment', 'mission')),
    add column mission jsonb constraint activities_mission_object_check
        check (mission is null or jsonb_typeof(mission) = 'object');
alter table catalogue.activities
    add constraint activities_mission_check check (mission is null or kind = 'mission');

-- Vocabulaire structuré du module ; le son de chaque entrée est un segment (start, end) d'un média versionné.
alter table catalogue.modules
    add column vocabulary jsonb not null default '[]' check (jsonb_typeof(vocabulary) = 'array');
