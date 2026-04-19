-- Migration: Add read_at column to notifications table
-- Date: 2026-04-05

-- Add read_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Column read_at added to notifications table';
    ELSE
        RAISE NOTICE 'Column read_at already exists in notifications table';
    END IF;
END $$;

-- Update existing notifications to set read_at for records that are marked as read
UPDATE notifications
SET read_at = updated_at
WHERE is_read = true AND read_at IS NULL;
