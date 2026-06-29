-- Alinear lock_date con match_date: las predicciones cierran al inicio del partido, no 15 min antes.
-- Ejecutar en producción si el backend aún no está actualizado, o como limpieza de datos.

UPDATE matches
SET lock_date = match_date
WHERE status = 'scheduled'
  AND match_date IS NOT NULL
  AND (lock_date IS NULL OR lock_date < match_date);
