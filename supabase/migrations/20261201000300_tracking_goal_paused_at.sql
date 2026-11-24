-- Instant de la mise en pause d'un objectif, projeté par Suivi. Un objectif en pause ne compte en retard que les séances
-- échues avant la pause. L'heure d'état (status_at) ne suffit pas : l'annonce d'une reprise prévue
-- (learning.goal_resumed, l'objectif reste en pause) la déplace, et les séances tombées entre la pause et cette annonce
-- seraient comptées en retard. paused_at est posé au passage en pause et effacé à la reprise.
alter table tracking.goals add column paused_at timestamptz;

update tracking.goals g
set paused_at = coalesce((
        select max(l.occurred_at) from tracking.event_log l
        where l.type = 'learning.goal_paused' and l.data->>'enrollmentId' = g.enrollment_id::text
    ), g.status_at)
where g.goal_status = 'paused';
