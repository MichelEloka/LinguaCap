create schema if not exists catalogue;
revoke all on schema catalogue from public;

create table catalogue.levels (
    id text primary key,
    code text not null unique check (code ~ '^[ABC][12]$'),
    title text not null check (length(trim(title)) between 1 and 120),
    description text not null default '' check (length(description) <= 2000),
    status text not null default 'draft' check (status in ('draft', 'published')),
    version integer not null default 1 check (version > 0)
);

create table catalogue.lessons (
    id text primary key,
    level_id text not null references catalogue.levels(id),
    title text not null,
    description text not null,
    transcript text not null,
    media_ids text[] not null default '{}'
);

create table catalogue.questions (
    lesson_id text not null references catalogue.lessons(id),
    id text not null,
    position integer not null check (position > 0),
    prompt text not null,
    primary key (lesson_id, id),
    unique (lesson_id, position)
);

create table catalogue.options (
    lesson_id text not null,
    question_id text not null,
    id text not null,
    position integer not null check (position > 0),
    label text not null,
    correct boolean not null default false,
    foreign key (lesson_id, question_id) references catalogue.questions(lesson_id, id),
    primary key (lesson_id, question_id, id),
    unique (lesson_id, question_id, position)
);

create unique index options_one_correct_per_question
    on catalogue.options (lesson_id, question_id)
    where correct;

insert into catalogue.levels (id, code, title, description, status) values
    ('a1', 'A1', 'Allemand A1', 'S’exprimer dans des situations simples du quotidien.', 'published'),
    ('a2', 'A2', 'Allemand A2', 'Préparer des échanges simples sur sa vie de tous les jours.', 'published'),
    ('b1', 'B1', 'Allemand B1', 'Brouillon éditorial du parcours intermédiaire.', 'draft');

insert into catalogue.lessons (id, level_id, title, description, transcript, media_ids) values
    ('commander-au-cafe', 'a1', 'Commander au café',
     'Reconnaissez un mot à l’oral, puis apprenez à commander une boisson poliment.',
     'Kaffee. Ich möchte einen Kaffee, bitte.',
     array['kaffee-image', 'kaffee-audio']);

insert into catalogue.questions (lesson_id, id, position, prompt) values
    ('commander-au-cafe', 'cafe-question', 1, 'Quelle boisson est commandée dans l’enregistrement ?');

insert into catalogue.options (lesson_id, question_id, id, position, label, correct) values
    ('commander-au-cafe', 'cafe-question', 'cafe', 1, 'Un café', true),
    ('commander-au-cafe', 'cafe-question', 'the', 2, 'Un thé', false),
    ('commander-au-cafe', 'cafe-question', 'eau', 3, 'De l’eau', false);
