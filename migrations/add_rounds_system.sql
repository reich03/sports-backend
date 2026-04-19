-- =====================================================
-- ROUNDS/JORNADAS SYSTEM - Dynamic Tournament Structure
-- =====================================================
-- This table allows flexible tournament structures:
-- - Regular leagues (Jornada 1, 2, 3...)
-- - Group stages (Grupo A, Grupo B...)
-- - Knockout rounds (Octavos, Cuartos, Semifinal, Final)
-- - Friendly matches (no round needed)

CREATE TABLE IF NOT EXISTS rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    round_type VARCHAR(50) DEFAULT 'regular' CHECK (round_type IN ('regular', 'group_stage', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'final', 'friendly')),
    round_number INTEGER,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add round_id to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS round_id UUID REFERENCES rounds(id) ON DELETE SET NULL;

-- Make league_id nullable (for friendly matches)
ALTER TABLE matches ALTER COLUMN league_id DROP NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rounds_league ON rounds(league_id);
CREATE INDEX IF NOT EXISTS idx_rounds_sport ON rounds(sport_id);
CREATE INDEX IF NOT EXISTS idx_rounds_type ON rounds(round_type);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round_id);

-- =====================================================
-- LEAGUE STANDINGS TABLE (for table positions)
-- =====================================================
CREATE TABLE IF NOT EXISTS league_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
    position INTEGER,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    form VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, team_id, round_id)
);

CREATE INDEX IF NOT EXISTS idx_standings_league ON league_standings(league_id);
CREATE INDEX IF NOT EXISTS idx_standings_team ON league_standings(team_id);
CREATE INDEX IF NOT EXISTS idx_standings_round ON league_standings(round_id);
CREATE INDEX IF NOT EXISTS idx_standings_position ON league_standings(league_id, position);

COMMENT ON TABLE rounds IS 'Flexible round/phase structure for tournaments and leagues';
COMMENT ON COLUMN rounds.round_type IS 'Type of round: regular (league matchday), group_stage, knockout phases, etc.';
COMMENT ON COLUMN rounds.metadata IS 'Flexible data: group names, bracket positions, special rules, etc.';
COMMENT ON TABLE league_standings IS 'Team standings/positions in leagues, can be per round or overall';
