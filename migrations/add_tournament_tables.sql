-- ============================================================
-- MIGRACIÓN: Módulo de Torneos (Mundial FIFA 2026)
-- ============================================================

-- Agregar unique constraint en teams.short_name (necesario para el seed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_short_name_unique'
  ) THEN
    ALTER TABLE teams ADD CONSTRAINT teams_short_name_unique UNIQUE (short_name);
  END IF;
END $$;

-- Tabla principal de torneos (pollas del Mundial)
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private')),
  access_code VARCHAR(10) UNIQUE,
  status VARCHAR(10) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
 champion_points INTEGER DEFAULT 45,
 runner_up_points INTEGER DEFAULT 35,
 third_place_points INTEGER DEFAULT 25,
  scoring_rules JSONB DEFAULT '{"exact_score":10,"correct_winner":5,"correct_draw":5,"home_goal_bonus":2,"away_goal_bonus":2,"strict_winner":true}'::jsonb,
  special_predictions_locked BOOLEAN DEFAULT FALSE,
  image VARCHAR(500),
  created_by UUID NOT NULL REFERENCES users(id),
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participantes del torneo
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  match_points INTEGER DEFAULT 0,
  special_points INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Predicciones especiales: Campeón / Subcampeón / Tercer puesto
CREATE TABLE IF NOT EXISTS tournament_special_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  champion_team_id UUID REFERENCES teams(id),
  runner_up_team_id UUID REFERENCES teams(id),
  third_place_team_id UUID REFERENCES teams(id),
  champion_points_earned INTEGER DEFAULT 0,
  runner_up_points_earned INTEGER DEFAULT 0,
  third_place_points_earned INTEGER DEFAULT 0,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments(type);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_points ON tournament_participants(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_special_tournament ON tournament_special_predictions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_special_user ON tournament_special_predictions(user_id);

-- Triggers updated_at (la función ya existe desde init.sql)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tournaments_updated_at') THEN
    CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tournament_participants_updated_at') THEN
    CREATE TRIGGER update_tournament_participants_updated_at BEFORE UPDATE ON tournament_participants
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tournament_special_updated_at') THEN
    CREATE TRIGGER update_tournament_special_updated_at BEFORE UPDATE ON tournament_special_predictions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Agregar tournament_id a predictions (predicciones aisladas por torneo)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;

-- Eliminar el constraint único antiguo (user_id, match_id) que impedía predecir el mismo
-- partido en torneos distintos. Se reemplaza por índices parciales condicionales.
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_user_id_match_id_key;
DROP INDEX IF EXISTS predictions_user_id_match_id;
DROP INDEX IF EXISTS idx_predictions_user_match;

CREATE UNIQUE INDEX IF NOT EXISTS predictions_user_tournament_match
  ON predictions(user_id, match_id, tournament_id)
  WHERE tournament_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS predictions_user_match_notournament
  ON predictions(user_id, match_id)
  WHERE tournament_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_predictions_tournament ON predictions(tournament_id);

DO $$ BEGIN RAISE NOTICE 'Migracion de torneos aplicada correctamente.'; END $$;
