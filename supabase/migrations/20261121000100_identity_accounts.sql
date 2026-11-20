-- Incrément 2 · comptes, invitations, rattachements et permissions (DEV-012, DEV-013, DEV-018, DEV-022 à DEV-024).
-- Compatible avec la version précédente du service Identités pendant le déploiement :
-- colonnes ajoutées avec valeurs par défaut, contrainte unique sur l'adresse d'invitation conservée.

-- Rôle « Équipe » (staff) : compte sans élèves, qui reçoit des permissions Catalogue ou Correction.
alter table identity.profiles drop constraint profiles_role_check;
alter table identity.profiles add constraint profiles_role_check
    check (role in ('admin', 'teacher', 'learner', 'staff'));

alter table identity.profiles
    add column status text not null default 'active' check (status in ('active', 'disabled')),
    add column disabled_at timestamptz,
    add column last_seen_at timestamptz;
alter table identity.profiles add constraint profiles_disabled_check
    check ((status = 'disabled') = (disabled_at is not null));

-- Invitations : expiration, annulation, réémissions. Une adresse garde une seule invitation (pas de doublon).
alter table identity.invitations drop constraint invitations_role_check;
alter table identity.invitations add constraint invitations_role_check
    check (role in ('admin', 'teacher', 'learner', 'staff'));
alter table identity.invitations alter column invited_by drop not null;
alter table identity.invitations add constraint invitations_inviter_check
    check (invited_by is not null or role = 'admin');

alter table identity.invitations
    add column expires_at timestamptz,
    add column cancelled_at timestamptz,
    add column last_sent_at timestamptz,
    add column send_count integer not null default 0 check (send_count >= 0);
update identity.invitations
   set expires_at = coalesce(sent_at, created_at) + interval '7 days',
       last_sent_at = sent_at,
       send_count = case when sent_at is null then 0 else 1 end;
alter table identity.invitations
    alter column expires_at set default now() + interval '7 days',
    alter column expires_at set not null;
alter table identity.invitations add constraint invitations_cancel_check
    check (cancelled_at is null or accepted_at is null);

-- Permissions accordées par l'administration.
create table identity.permissions (
    profile_id uuid not null references identity.profiles(id),
    permission text not null check (permission in ('catalogue', 'correction')),
    granted_by uuid references identity.profiles(id),
    granted_at timestamptz not null default now(),
    primary key (profile_id, permission)
);

-- Historique des professeurs référents. profiles.teacher_id reste le référent actif (un seul par élève).
create table identity.teacher_assignments (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null references identity.profiles(id),
    teacher_id uuid not null references identity.profiles(id),
    assigned_by uuid references identity.profiles(id),
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    check (ended_at is null or ended_at >= started_at)
);
create unique index teacher_assignments_active_idx on identity.teacher_assignments (learner_id) where ended_at is null;
create index teacher_assignments_learner_idx on identity.teacher_assignments (learner_id, started_at desc);

insert into identity.teacher_assignments (learner_id, teacher_id, started_at)
select id, teacher_id, created_at from identity.profiles where teacher_id is not null;

-- L'auteur d'une réaffectation est transmis par le service avec set_config('linguacap.actor_id', ..., true).
create function identity.record_teacher_assignment() returns trigger
    language plpgsql
    set search_path = ''
as $$
declare
    actor uuid := nullif(current_setting('linguacap.actor_id', true), '')::uuid;
begin
    if tg_op = 'UPDATE' and new.teacher_id is not distinct from old.teacher_id then
        return new;
    end if;
    update identity.teacher_assignments set ended_at = now()
     where learner_id = new.id and ended_at is null;
    if new.teacher_id is not null then
        insert into identity.teacher_assignments (learner_id, teacher_id, assigned_by)
        values (new.id, new.teacher_id, actor);
    end if;
    return new;
end;
$$;

create trigger profiles_teacher_history
    after insert or update of teacher_id on identity.profiles
    for each row execute function identity.record_teacher_assignment();

-- Correcteur désigné pour un élève autonome, avec historique.
create table identity.reviewer_assignments (
    id uuid primary key default gen_random_uuid(),
    learner_id uuid not null references identity.profiles(id),
    reviewer_id uuid not null references identity.profiles(id),
    assigned_by uuid references identity.profiles(id),
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    check (learner_id <> reviewer_id),
    check (ended_at is null or ended_at >= started_at)
);
create unique index reviewer_assignments_active_idx on identity.reviewer_assignments (learner_id) where ended_at is null;
create index reviewer_assignments_reviewer_idx on identity.reviewer_assignments (reviewer_id) where ended_at is null;

-- Table de sortie des événements métier (enveloppe : contracts/events/event-envelope.schema.json).
create table identity.outbox_events (
    id uuid primary key,
    type text not null check (type ~ '^identity\.[a-z_]+$'),
    version integer not null default 1 check (version > 0),
    occurred_at timestamptz not null default now(),
    subject_kind text not null,
    subject_id text not null,
    learner_id uuid,
    request_id text,
    data jsonb not null default '{}' check (jsonb_typeof(data) = 'object'),
    published_at timestamptz
);
create index outbox_events_pending_idx on identity.outbox_events (occurred_at) where published_at is null;

-- Premier administrateur : opération serveur exécutée avec le rôle de migration (infra/pilot/bootstrap-admin.mjs).
create function identity.bootstrap_admin_invitation(p_email text, p_display_name text) returns uuid
    language plpgsql
    set search_path = ''
as $$
declare
    invitation_id uuid;
    normalized text := lower(btrim(p_email));
begin
    if exists (select 1 from identity.profiles where role = 'admin' and status = 'active') then
        raise exception 'Un administrateur actif existe déjà : invitez les autres comptes depuis LinguaCap.';
    end if;
    insert into identity.invitations (id, email, display_name, role, teacher_id, invited_by, expires_at)
    values (gen_random_uuid(), normalized, btrim(p_display_name), 'admin', null, null, now() + interval '7 days')
    on conflict (email) do update
        set display_name = excluded.display_name, role = 'admin', teacher_id = null,
            cancelled_at = null, expires_at = excluded.expires_at
        where identity.invitations.accepted_at is null
    returning id into invitation_id;
    if invitation_id is null then
        raise exception 'Cette adresse correspond déjà à un compte LinguaCap.';
    end if;
    return invitation_id;
end;
$$;
revoke all on function identity.bootstrap_admin_invitation(text, text) from public;

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_identity') then
        grant select, insert, update on identity.profiles to lingua_identity;
        grant select, insert, update on identity.invitations to lingua_identity;
        grant select, insert, delete on identity.permissions to lingua_identity;
        grant select, insert, update on identity.teacher_assignments to lingua_identity;
        grant select, insert, update on identity.reviewer_assignments to lingua_identity;
        grant select, insert, update on identity.outbox_events to lingua_identity;
    end if;
end;
$$;
