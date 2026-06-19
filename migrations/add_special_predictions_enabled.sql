-- Habilitar/deshabilitar menciones especiales por torneo
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS special_predictions_enabled BOOLEAN NOT NULL DEFAULT true;

-- Unificar reglas de puntuación MASTERSPORTS en deportes de marcador
UPDATE sports
SET scoring_rules = '{"exact_score":10,"correct_winner":5,"correct_draw":5,"home_goal_bonus":2,"away_goal_bonus":2}'::jsonb
WHERE prediction_type = 'score';

-- Unificar reglas en torneos existentes (eliminar strict_winner)
UPDATE tournaments
SET scoring_rules = '{"exact_score":10,"correct_winner":5,"correct_draw":5,"home_goal_bonus":2,"away_goal_bonus":2}'::jsonb;
