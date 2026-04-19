-- Migration: Add is_processed column to predictions table
-- Date: 2025-01-XX

-- Add is_processed column
ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT false;

-- Update existing records: set is_processed to true where is_correct is not null
-- (meaning the prediction has already been evaluated)
UPDATE predictions 
SET is_processed = true 
WHERE is_correct IS NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_predictions_processed ON predictions(is_processed);
