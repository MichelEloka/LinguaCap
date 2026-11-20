ALTER TABLE learning.goal_plans
    DROP CONSTRAINT goal_plans_level_check,
    ADD CONSTRAINT goal_plans_level_check CHECK (level ~ '^[ABC][12]$');
