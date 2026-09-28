-- Cierre independiente de predicción de pole position (clasificación / sábado)
ALTER TABLE f1_events
  ADD COLUMN IF NOT EXISTS pole_lock_date TIMESTAMPTZ;
