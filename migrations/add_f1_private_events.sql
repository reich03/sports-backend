-- Eventos F1 públicos / privados (código de acceso)
ALTER TABLE f1_events
  ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'public'
    CHECK (type IN ('public', 'private'));

ALTER TABLE f1_events
  ADD COLUMN IF NOT EXISTS access_code VARCHAR(10) UNIQUE;

ALTER TABLE f1_events
  ADD COLUMN IF NOT EXISTS max_participants INTEGER;

CREATE TABLE IF NOT EXISTS f1_event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES f1_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_f1_event_participants_event ON f1_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_f1_event_participants_user ON f1_event_participants(user_id);
