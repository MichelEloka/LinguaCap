-- Incrément « Parcours » · langues proposées et test de niveau (banque de questions par langue).
-- Additif : la version précédente du service lit catalogue.languages (id, name) sans être gênée par les nouvelles colonnes.

-- Langues du catalogue : nom dans la langue elle-même, statut (proposée ou bientôt) et ordre d'affichage.
alter table catalogue.languages
    add column native_name text not null default '' check (length(native_name) <= 60),
    add column status text not null default 'coming_soon' check (status in ('available', 'coming_soon')),
    add column position integer not null default 100 check (position > 0);

update catalogue.languages set native_name = 'Deutsch', status = 'available', position = 1 where id = 'de';

insert into catalogue.languages (id, name, native_name, status, position) values
    ('en', 'Anglais', 'English', 'coming_soon', 2),
    ('es', 'Espagnol', 'Español', 'coming_soon', 3),
    ('it', 'Italien', 'Italiano', 'coming_soon', 4),
    ('pt', 'Portugais', 'Português', 'coming_soon', 5),
    ('nl', 'Néerlandais', 'Nederlands', 'coming_soon', 6),
    ('fr', 'Français langue étrangère', 'Français', 'coming_soon', 7),
    ('ar', 'Arabe', 'العربية', 'coming_soon', 8),
    ('zh', 'Chinois (mandarin)', '中文', 'coming_soon', 9),
    ('ja', 'Japonais', '日本語', 'coming_soon', 10),
    ('ru', 'Russe', 'Русский', 'coming_soon', 11),
    ('ko', 'Coréen', '한국어', 'coming_soon', 12),
    ('tr', 'Turc', 'Türkçe', 'coming_soon', 13),
    ('pl', 'Polonais', 'Polski', 'coming_soon', 14)
on conflict (id) do nothing;

-- Banque du test de niveau d'une langue, versionnée comme un parcours : un brouillon s'enregistre d'un bloc, une
-- seule banque publiée par langue, la précédente est retirée à la publication. Les paliers (A1, A2, B1…) portent leurs
-- seuils, le nombre de questions tirées et les questions fermées avec corrigés et supports (sons, images).
create table catalogue.placement_tests (
    id uuid primary key default gen_random_uuid(),
    language_id text not null references catalogue.languages(id),
    number integer not null check (number > 0),
    status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
    title text not null default '' check (length(title) <= 120),
    description text not null default '' check (length(description) <= 2000),
    tiers jsonb not null default '[]' check (jsonb_typeof(tiers) = 'array'),
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    published_at timestamptz,
    retired_at timestamptz,
    unique (language_id, number),
    check (status = 'draft' or published_at is not null)
);
create unique index placement_tests_one_published_idx on catalogue.placement_tests (language_id) where status = 'published';
revoke all on catalogue.placement_tests from public, anon, authenticated;

-- Une banque publiée ou retirée est figée : seules les transitions brouillon → publiée → retirée restent permises.
create function catalogue.ensure_placement_editable() returns trigger
    language plpgsql
    set search_path = ''
as $$
begin
    if old.status <> 'draft'
       and (new.tiers is distinct from old.tiers or new.title is distinct from old.title
            or new.description is distinct from old.description or new.language_id <> old.language_id
            or new.number <> old.number) then
        raise exception 'Ce test de niveau est publié : créez un nouveau brouillon pour le modifier.';
    end if;
    if old.status = 'retired' and new.status <> 'retired'
       or old.status = 'published' and new.status = 'draft' then
        raise exception 'Un test de niveau retiré le reste, et un test publié ne redevient pas un brouillon.';
    end if;
    return new;
end;
$$;

create trigger placement_tests_frozen before update on catalogue.placement_tests
    for each row execute function catalogue.ensure_placement_editable();

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_catalogue') then
        grant select, insert, update on catalogue.placement_tests to lingua_catalogue;
    end if;
end;
$$;
