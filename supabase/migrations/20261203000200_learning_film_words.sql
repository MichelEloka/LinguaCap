-- Ciné-club (EVO-055) · carnet de mots de l'élève et séquences de film proposées par l'équipe pédagogique.
-- Additif : aucune table existante ne change. Le Ciné-club est facultatif : hors parcours, hors contrat, hors durées
-- conseillées ; aucune donnée ici ne touche aux séances ni au planning.
-- Droits : lingua_learning lit et écrit les deux tables (aussi dans infra/pilot/db-grants.sql, la recette créant les
-- rôles après les migrations).

-- Mot noté par l'élève pendant un film, depuis le lexique d'un module (activity) ou librement (manual). source_id :
-- séquence de film, ou référence d'activité choisie par l'interface ; null pour une saisie libre. Un mot n'est noté
-- qu'une fois par source (casse ignorée) ; 3 000 mots au plus par élève (contrôlé par le service).
create table learning.learner_words (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    language_id text not null check (language_id ~ '^[a-z]{2}$'),
    word text not null check (length(btrim(word)) between 1 and 80 and length(word) <= 80),
    note text not null default '' check (length(note) <= 200),
    source_kind text not null check (source_kind in ('film', 'activity', 'manual')),
    source_id text check (source_id ~ '^[A-Za-z0-9][A-Za-z0-9:/._-]{0,119}$'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check ((source_kind = 'manual') = (source_id is null))
);
create unique index learner_words_unique_idx
    on learning.learner_words (learner_id, lower(word), coalesce(source_id, ''));
create index learner_words_learner_idx on learning.learner_words (learner_id, created_at desc);
revoke all on learning.learner_words from public, anon, authenticated;

-- Séquence proposée à un élève par son professeur référent, son correcteur désigné ou l'administration (sans
-- planification). L'élève l'écarte quand il le souhaite ; une seule proposition en cours par séquence.
create table learning.film_recommendations (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null,
    film_id text not null check (film_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(film_id) <= 48),
    sequence_id text not null check (sequence_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(sequence_id) <= 59),
    recommended_by uuid not null,
    recommended_by_role text not null check (recommended_by_role in ('teacher', 'reviewer', 'admin')),
    note text not null default '' check (length(note) <= 300),
    created_at timestamptz not null default now(),
    dismissed_at timestamptz,
    check (dismissed_at is null or dismissed_at >= created_at)
);
create unique index film_recommendations_open_idx
    on learning.film_recommendations (learner_id, sequence_id) where dismissed_at is null;
create index film_recommendations_learner_idx on learning.film_recommendations (learner_id, created_at desc);
revoke all on learning.film_recommendations from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_learning') then
        grant select, insert, update, delete on learning.learner_words to lingua_learning;
        grant select, insert, update on learning.film_recommendations to lingua_learning;
    end if;
end;
$$;
