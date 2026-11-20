BEGIN;
GRANT USAGE ON SCHEMA identity TO lingua_identity;
GRANT SELECT, INSERT, UPDATE ON identity.profiles TO lingua_identity;
GRANT SELECT, INSERT, UPDATE ON identity.invitations TO lingua_identity;
GRANT SELECT, INSERT, DELETE ON identity.permissions TO lingua_identity;
GRANT SELECT, INSERT, UPDATE ON identity.teacher_assignments TO lingua_identity;
GRANT SELECT, INSERT, UPDATE ON identity.reviewer_assignments TO lingua_identity;
GRANT SELECT, INSERT, UPDATE ON identity.outbox_events TO lingua_identity;

GRANT USAGE ON SCHEMA catalogue TO lingua_catalogue;
GRANT SELECT, INSERT, UPDATE ON catalogue.levels TO lingua_catalogue;
GRANT SELECT ON catalogue.languages, catalogue.competences TO lingua_catalogue;
GRANT SELECT, INSERT, UPDATE ON catalogue.track_versions TO lingua_catalogue;
GRANT SELECT, INSERT, UPDATE, DELETE ON catalogue.modules, catalogue.activities, catalogue.media_placements,
    catalogue.lessons, catalogue.questions, catalogue.options, catalogue.version_assessments TO lingua_catalogue;

GRANT USAGE ON SCHEMA media TO lingua_media;
GRANT SELECT, INSERT, UPDATE ON media.assets, media.asset_versions, media.uploads TO lingua_media;
GRANT SELECT, INSERT, UPDATE, DELETE ON media.storage_read_grants TO lingua_media;
GRANT SELECT, INSERT, UPDATE ON media.productions TO lingua_media;
GRANT SELECT, INSERT, UPDATE, DELETE ON media.production_read_grants TO lingua_media;

GRANT USAGE ON SCHEMA learning TO lingua_learning;
GRANT SELECT, INSERT, UPDATE ON learning.goal_plans TO lingua_learning;
GRANT SELECT, INSERT, UPDATE ON learning.enrollments, learning.sessions, learning.session_activities,
    learning.activity_progress TO lingua_learning;
GRANT SELECT, INSERT, UPDATE, DELETE ON learning.availabilities TO lingua_learning;
GRANT SELECT, INSERT, UPDATE ON learning.plan_revisions, learning.session_due_history TO lingua_learning;

GRANT USAGE ON SCHEMA assessment TO lingua_assessment;
GRANT SELECT, INSERT ON assessment.quiz_attempts TO lingua_assessment;
GRANT SELECT, INSERT, UPDATE ON assessment.exam_attempts TO lingua_assessment;

GRANT USAGE ON SCHEMA tracking TO lingua_tracking;
GRANT SELECT, INSERT ON tracking.encouragements TO lingua_tracking;
COMMIT;
