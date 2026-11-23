-- EVO-042 · Horloge des événements d'état d'un objectif.
-- Suivi garde, pour chaque objectif, l'état porté par l'événement le plus récent selon occurred_at. La valeur par
-- défaut now() est l'heure de DÉBUT de la transaction : une horloge recalée en arrière ou deux transactions qui se
-- chevauchent pouvaient donner à une pause une heure antérieure à la validation qui la précède, et Suivi écartait la
-- pause. Apprentissage horodate désormais goal_set, plan_validated, goal_paused et goal_status_changed avec une
-- horloge propre à l'objectif, strictement croissante : cette colonne garde la dernière heure attribuée.
-- Colonne ajoutée à une table déjà ouverte à lingua_learning (SELECT, INSERT, UPDATE) : aucun droit nouveau.
alter table learning.enrollments add column goal_event_at timestamptz;

-- Reprise : dernière heure déjà émise pour chaque objectif, pour que le prochain événement la dépasse.
update learning.enrollments e set goal_event_at = emitted.at
from (
    select data->>'enrollmentId' as enrollment_id, max(occurred_at) as at
    from learning.outbox_events
    where type in ('learning.goal_set', 'learning.plan_validated', 'learning.goal_paused', 'learning.goal_resumed',
                   'learning.goal_status_changed')
      and data ? 'enrollmentId'
    group by 1
) emitted
where emitted.enrollment_id = e.id::text;
