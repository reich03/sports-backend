-- Script to reopen a match for testing
-- This will reset the match and its predictions

-- Replace YOUR_MATCH_ID with the actual match ID
-- You can find this in the logs or admin panel

-- Reopen the match (set your match ID here)
UPDATE matches 
SET status = 'scheduled', 
    predictions_locked = false,
    home_score = NULL, 
    away_score = NULL 
WHERE id = '8cb3ebac-4aed-4248-b6fd-1b84553d3bc2';

-- Reset predictions for this match
UPDATE predictions 
SET is_processed = false, 
    points_earned = 0, 
    is_correct = NULL 
WHERE match_id = '8cb3ebac-4aed-4248-b6fd-1b84553d3bc2';

-- Also reset user points that were awarded (optional - only if you want to reset completely)
-- Uncomment the following if needed:
-- UPDATE users u
-- SET total_points = total_points - COALESCE((
--     SELECT SUM(points_earned) 
--     FROM predictions 
--     WHERE user_id = u.id 
--     AND match_id = '8cb3ebac-4aed-4248-b6fd-1b84553d3bc2'
--     AND is_processed = true
-- ), 0);

SELECT 'Match and predictions reset successfully!' as result;
