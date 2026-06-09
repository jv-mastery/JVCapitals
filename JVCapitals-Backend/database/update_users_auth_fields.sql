-- Migration: Add account verification and password reset fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
-- Existing users are likely already trusted/active, 
-- so we mark them as verified to prevent breaking their current access.
UPDATE users
SET is_verified = TRUE
WHERE is_verified IS FALSE;
-- Add an index for the reset token to speed up lookups during password recovery
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);