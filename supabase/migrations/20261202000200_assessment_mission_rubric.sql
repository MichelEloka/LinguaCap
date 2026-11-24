-- Cours B1 et B2 · missions notées sur grille et productions plus longues.
-- Additif : une mission sans grille (A1, A2) garde points, score et max_score à null, comme avant ; le texte d'une
-- remise passe de 1 500 à 3 000 caractères au plus (bornes communes avec le catalogue, Évaluations et l'interface).
-- Les contraintes sont nommées : sans nom, Postgres appellerait la contrainte de colonne de score
-- mission_submissions_score_check, nom pris ici par la règle d'ensemble de la notation.
-- Droits : colonnes ajoutées à une table déjà ouverte à lingua_assessment (SELECT, INSERT, UPDATE) ; aucun droit nouveau.

alter table assessment.mission_submissions
    drop constraint mission_submissions_text_check,
    add constraint mission_submissions_text_check check (length(text) <= 3000),
    -- Points par critère ({identifiant du critère: entier}), saisis par le correcteur avec son retour.
    add column points jsonb constraint mission_submissions_points_object_check
        check (points is null or jsonb_typeof(points) = 'object'),
    -- Somme des points et somme des maxima de la grille (20 en B1 et B2).
    add column score integer constraint mission_submissions_score_value_check check (score is null or score >= 0),
    add column max_score integer constraint mission_submissions_max_score_check check (max_score is null or max_score > 0),
    -- Une notation est complète (points, score et maximum ensemble), cohérente et posée avec le retour du correcteur.
    add constraint mission_submissions_score_check
        check ((score is null) = (max_score is null) and (points is null) = (score is null)
               and (score is null or score <= max_score and status = 'reviewed'));
