-- Contenus V4 et pédagogie · les séances planifient aussi des missions (activité « mission » du catalogue).
-- Une mission se termine avec sa remise (attempt_id = identifiant de la mission, vérifié auprès d'Évaluations).
-- Contrainte remplacée sur une table déjà ouverte à lingua_learning : aucun droit nouveau.
alter table learning.session_activities
    drop constraint session_activities_kind_check,
    add constraint session_activities_kind_check
        check (kind in ('lesson', 'exercise', 'review', 'assessment', 'mission'));
