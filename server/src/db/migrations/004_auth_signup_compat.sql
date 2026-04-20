-- Backfill auth-related columns for older installations so signup/login do not fail at runtime.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last DATE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

UPDATE users
SET display_name = COALESCE(display_name, split_part(email, '@', 1))
WHERE display_name IS NULL;

ALTER TABLE users
  ALTER COLUMN display_name SET NOT NULL;
