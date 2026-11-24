-- Cours B1 et B2 · niveau B2 au catalogue, en brouillon, après B1 (prérequis A2 → B1 → B2).
-- Additif : l'importeur exige que le niveau existe au catalogue, et seul un administrateur peut le créer par l'API.
-- Le niveau reste en brouillon tant qu'aucune version n'est publiée : il n'est proposé nulle part comme ouvert.
-- Un B2 déjà créé par l'administration (id 'b2', ou code 'B2') est conservé ; seules sa position et son prérequis
-- manquants sont complétés.
-- Droits : aucune table nouvelle ; lingua_catalogue lit et modifie déjà catalogue.levels.

insert into catalogue.levels (id, code, title, description, status, language_id, position, prerequisite_level_id)
values ('b2', 'B2', 'Allemand B2', 'Argumenter, nuancer et comprendre des textes complexes.', 'draft', 'de', 4, 'b1')
on conflict do nothing;

update catalogue.levels
   set position = coalesce(position, 4), prerequisite_level_id = coalesce(prerequisite_level_id, 'b1')
 where id = 'b2' and (position is null or prerequisite_level_id is null);

-- Le B1 cesse d'être un « brouillon éditorial » : sa description annonce le parcours complet (une description
-- modifiée depuis par un éditeur est conservée).
update catalogue.levels
   set description = 'Raconter, expliquer, défendre un avis et agir dans la vie courante et au travail.'
 where id = 'b1' and description = 'Brouillon éditorial du parcours intermédiaire.';
