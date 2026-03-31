-- Sprint E: Unified Milestones Migration
-- Run this ONCE against your production database before deploying Sprint E.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards).
--
-- What this does:
--   1. Renames wealth_milestones → milestones
--   2. Adds a domain column (default 'wealth' for existing rows)
--   3. Drops the old unique index and creates a new composite one
--   4. Adds blockerNote column (already added in Sprint D — idempotent)
--
-- After running this migration, run:
--   pnpm drizzle-kit generate
--   pnpm drizzle-kit migrate
-- to keep Drizzle's migration history in sync.

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 1: Rename table (skip if already renamed)
-- ─────────────────────────────────────────────────────────────────────────────
SET @table_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE()
  AND table_name = 'wealth_milestones'
);

-- Only rename if old table still exists
-- (MySQL does not support IF EXISTS on RENAME TABLE, so we use a stored procedure)
DROP PROCEDURE IF EXISTS sprint_e_rename_milestones;
DELIMITER //
CREATE PROCEDURE sprint_e_rename_milestones()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'wealth_milestones'
  ) THEN
    RENAME TABLE wealth_milestones TO milestones;
  END IF;
END //
DELIMITER ;
CALL sprint_e_rename_milestones();
DROP PROCEDURE IF EXISTS sprint_e_rename_milestones;

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 2: Add domain column (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sprint_e_add_domain;
DELIMITER //
CREATE PROCEDURE sprint_e_add_domain()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'milestones'
    AND column_name = 'domain'
  ) THEN
    ALTER TABLE milestones
      ADD COLUMN domain ENUM('wealth', 'agent', 'business') NOT NULL DEFAULT 'wealth'
      AFTER user_id;
  END IF;
END //
DELIMITER ;
CALL sprint_e_add_domain();
DROP PROCEDURE IF EXISTS sprint_e_add_domain;

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 3: Add blockerNote column (idempotent — may already exist from Sprint D)
-- ─────────────────────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sprint_e_add_blocker_note;
DELIMITER //
CREATE PROCEDURE sprint_e_add_blocker_note()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'milestones'
    AND column_name = 'blocker_note'
  ) THEN
    ALTER TABLE milestones ADD COLUMN blocker_note TEXT;
  END IF;
END //
DELIMITER ;
CALL sprint_e_add_blocker_note();
DROP PROCEDURE IF EXISTS sprint_e_add_blocker_note;

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 4: Update unique index to include domain
-- ─────────────────────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sprint_e_update_index;
DELIMITER //
CREATE PROCEDURE sprint_e_update_index()
BEGIN
  -- Drop old unique index if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = 'milestones'
    AND index_name = 'milestones_user_id_milestone_key_unique'
  ) THEN
    ALTER TABLE milestones DROP INDEX milestones_user_id_milestone_key_unique;
  END IF;

  -- Drop old index under the wealth_milestones name if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = 'milestones'
    AND index_name = 'wealth_milestones_user_id_milestone_key_unique'
  ) THEN
    ALTER TABLE milestones DROP INDEX wealth_milestones_user_id_milestone_key_unique;
  END IF;

  -- Create new composite unique index
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = 'milestones'
    AND index_name = 'milestones_user_domain_key_unique'
  ) THEN
    ALTER TABLE milestones
      ADD UNIQUE INDEX milestones_user_domain_key_unique (user_id, domain, milestone_key);
  END IF;
END //
DELIMITER ;
CALL sprint_e_update_index();
DROP PROCEDURE IF EXISTS sprint_e_update_index;

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 5: Add performance index on (userId, domain)
-- ─────────────────────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sprint_e_add_perf_index;
DELIMITER //
CREATE PROCEDURE sprint_e_add_perf_index()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = 'milestones'
    AND index_name = 'milestones_user_id_domain_idx'
  ) THEN
    ALTER TABLE milestones
      ADD INDEX milestones_user_id_domain_idx (user_id, domain);
  END IF;
END //
DELIMITER ;
CALL sprint_e_add_perf_index();
DROP PROCEDURE IF EXISTS sprint_e_add_perf_index;

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 6: Verify
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  'milestones' AS table_name,
  COUNT(*) AS row_count
FROM milestones;

SELECT
  column_name,
  column_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = DATABASE()
AND table_name = 'milestones'
ORDER BY ordinal_position;
