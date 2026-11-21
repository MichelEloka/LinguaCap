-- Les réponses des anciens profils restent inconnues jusqu'à une nouvelle soumission.
alter table identity.teacher_profiles
    add column accepting_new_students boolean,
    add column course_creation_mode text check (course_creation_mode in ('self', 'linguacap')),
    add constraint teacher_onboarding_answers_complete
        check ((accepting_new_students is null) = (course_creation_mode is null));

create index teacher_profile_event_period_idx on tracking.event_log (occurred_at, sequence)
    where producer = 'identity' and type = 'identity.teacher_profile_updated';
