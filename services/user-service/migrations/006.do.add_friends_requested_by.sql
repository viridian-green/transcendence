ALTER TABLE friends
    ADD COLUMN IF NOT EXISTS requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

UPDATE friends
SET requested_by = user_one
WHERE requested_by IS NULL;
