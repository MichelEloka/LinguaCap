-- Accusé de réception d'Apprentissage pour chaque remise et correction d'évaluation. La remise termine le créneau du
-- calendrier et fait avancer l'objectif (ou le parcours) chez Apprentissage ; si Apprentissage est indisponible à cet
-- instant, l'évaluation est enregistrée quand même et la notification est renvoyée à la lecture suivante de la tentative,
-- tant que cet accusé manque. Les remises antérieures sont réputées transmises.
alter table assessment.exam_attempts
    add column learning_acked text check (learning_acked in ('submitted', 'graded'));

update assessment.exam_attempts set learning_acked = status where status in ('submitted', 'graded');

comment on column assessment.exam_attempts.learning_acked is
    'Dernier état transmis à Apprentissage avec succès (submitted ou graded) ; null tant que la remise n''est pas transmise.';
