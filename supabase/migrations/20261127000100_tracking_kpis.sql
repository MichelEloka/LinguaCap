-- Incrément 8 · indicateurs administrateur (DEV-084 à DEV-091).
-- Une séance replanifiée garde la date de sa replanification : remplacée avant son échéance, elle sort du calcul
-- des séances à temps ; remplacée après, son retard reste comptabilisé.
alter table tracking.sessions add column superseded_at timestamptz;
