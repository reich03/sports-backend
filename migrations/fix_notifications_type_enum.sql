-- Corrige enum_notifications_type en producción (faltaban 'prediction', 'match', etc.)
-- Las predicciones se procesan igual; solo fallaba Notification.create.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_notifications_type' AND e.enumlabel = 'system'
    ) THEN
      ALTER TYPE enum_notifications_type ADD VALUE 'system';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_notifications_type' AND e.enumlabel = 'prediction'
    ) THEN
      ALTER TYPE enum_notifications_type ADD VALUE 'prediction';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_notifications_type' AND e.enumlabel = 'match'
    ) THEN
      ALTER TYPE enum_notifications_type ADD VALUE 'match';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_notifications_type' AND e.enumlabel = 'group'
    ) THEN
      ALTER TYPE enum_notifications_type ADD VALUE 'group';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_notifications_type' AND e.enumlabel = 'achievement'
    ) THEN
      ALTER TYPE enum_notifications_type ADD VALUE 'achievement';
    END IF;

    RAISE NOTICE 'Valores de enum_notifications_type actualizados';
  ELSE
    RAISE NOTICE 'No existe enum_notifications_type — la columna type ya es VARCHAR o otro tipo';
  END IF;
END $$;

-- Asegurar read_at (por si falta en algún entorno)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
