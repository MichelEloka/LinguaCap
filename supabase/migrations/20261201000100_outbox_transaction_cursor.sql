-- EVO-042 (suite) · Lecture des tables de sortie sans perte d'événement.
-- Suivi lisait « sequence > dernier numéro vu ». La séquence est attribuée à l'insertion, mais l'événement n'est visible
-- qu'à la validation de sa transaction : une transaction qui avait pris un numéro plus petit et validait APRÈS une
-- transaction de numéro plus grand voyait son événement sauté pour toujours (par exemple une pause restée « active »
-- dans le suivi). Chaque événement porte désormais sa transaction (tx). Les producteurs servent les événements dans
-- l'ordre (tx, sequence) et seulement ceux des transactions terminées (tx < xmin de l'instantané de lecture) : aucune
-- transaction encore ouverte ne peut ensuite ajouter un événement avant le curseur « <tx>:<sequence> » de Suivi.
--
-- Événements existants : tx = 0 (valeur par défaut figée à l'ajout de la colonne, sans réécriture de la table), puis la
-- valeur par défaut devient la transaction courante. Un ancien point de reprise numérique N vaut donc le curseur (0, N) :
-- les événements historiques après N, puis tous les nouveaux, sans perte ni doublon.
-- Droits : colonnes ajoutées à des tables déjà ouvertes aux rôles de service (lingua_identity, lingua_learning,
-- lingua_assessment, lingua_tracking) ; pg_current_xact_id, pg_current_snapshot et pg_snapshot_xmin sont ouvertes à
-- tous. Aucun droit nouveau.

alter table identity.outbox_events add column tx xid8 not null default '0';
alter table identity.outbox_events alter column tx set default pg_current_xact_id();
create index outbox_events_tx_sequence_idx on identity.outbox_events (tx, sequence);

alter table learning.outbox_events add column tx xid8 not null default '0';
alter table learning.outbox_events alter column tx set default pg_current_xact_id();
create index outbox_events_tx_sequence_idx on learning.outbox_events (tx, sequence);

alter table assessment.outbox_events add column tx xid8 not null default '0';
alter table assessment.outbox_events alter column tx set default pg_current_xact_id();
create index outbox_events_tx_sequence_idx on assessment.outbox_events (tx, sequence);

-- Suivi : curseur (transaction, séquence) par producteur. last_tx = 0 : point de reprise encore numérique.
alter table tracking.checkpoints add column last_tx bigint not null default 0 check (last_tx >= 0);

-- Révision du dernier planning projeté pour chaque objectif : un planning plus ancien, rattrapé ou arrivé en retard, ne
-- rouvre plus les séances qu'une révision plus récente a remplacées.
alter table tracking.goals add column plan_revision integer;
update tracking.goals g set plan_revision = applied.revision
from (
    select data->>'enrollmentId' as enrollment_id, max((data->>'revision')::integer) as revision
    from tracking.event_log
    where type = 'learning.plan_validated' and data ? 'enrollmentId' and data ? 'revision'
    group by 1
) applied
where applied.enrollment_id = g.enrollment_id::text;

-- Rattrapage des événements déjà sautés : un événement antérieur au point de reprise et absent du journal de Suivi a
-- été sauté par l'ancienne lecture. Le point de reprise recule juste avant le premier d'entre eux ; les événements déjà
-- reçus sont relus sans effet (déduplication par identifiant), les événements sautés sont enfin appliqués.
update tracking.checkpoints c set last_sequence = skipped.first - 1, updated_at = now()
from (
    select 'identity' as producer, min(o.sequence) as first from identity.outbox_events o
    where not exists (select 1 from tracking.event_log l where l.event_id = o.id)
    union all
    select 'learning', min(o.sequence) from learning.outbox_events o
    where not exists (select 1 from tracking.event_log l where l.event_id = o.id)
    union all
    select 'assessment', min(o.sequence) from assessment.outbox_events o
    where not exists (select 1 from tracking.event_log l where l.event_id = o.id)
) skipped
where c.producer = skipped.producer and skipped.first <= c.last_sequence and c.last_tx = 0;
