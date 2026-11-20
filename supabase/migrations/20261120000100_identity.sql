create schema if not exists identity;
revoke all on schema identity from public;

create table identity.profiles (
    id uuid primary key,
    display_name text not null check (length(btrim(display_name)) between 1 and 140),
    role text not null check (role in ('admin', 'teacher', 'learner')),
    teacher_id uuid references identity.profiles(id),
    created_at timestamptz not null default now(),
    check (teacher_id is null or (role = 'learner' and teacher_id <> id))
);

create index profiles_learner_teacher_idx on identity.profiles (teacher_id, display_name, id)
    where role = 'learner';

create table identity.invitations (
    id uuid primary key,
    email text not null unique check (email = lower(btrim(email)) and length(email) between 3 and 254),
    display_name text not null check (length(btrim(display_name)) between 1 and 140),
    role text not null check (role in ('teacher', 'learner')),
    teacher_id uuid references identity.profiles(id),
    invited_by uuid not null references identity.profiles(id),
    invited_user_id uuid unique,
    created_at timestamptz not null default now(),
    sent_at timestamptz,
    accepted_at timestamptz,
    check (teacher_id is null or role = 'learner'),
    check (sent_at is null or invited_user_id is not null),
    check (accepted_at is null or invited_user_id is not null)
);

do $$
begin
    if exists (select 1 from pg_roles where rolname = 'lingua_identity') then
        grant usage on schema identity to lingua_identity;
        grant select, insert on identity.profiles to lingua_identity;
        grant select, insert, update on identity.invitations to lingua_identity;
    end if;
end;
$$;
