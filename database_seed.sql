-- Master Sport Database Seed Script
-- PostgreSQL - Datos de prueba

-- Insert Sports
INSERT INTO sports (name, code, prediction_type, scoring_rules, is_active, "order") VALUES
('Fútbol', 'football', 'score', '{"exact_score": 5, "correct_winner": 3, "correct_draw": 3, "exact_difference": 2}'::jsonb, true, 1),
('Baloncesto', 'basketball', 'score', '{"exact_score": 5, "correct_winner": 3, "exact_difference": 2}'::jsonb, true, 2),
('Fórmula 1', 'f1', 'positions', '{"exact_podium": 10, "correct_position": 3, "in_podium": 1, "pole_position": 2}'::jsonb, true, 3)
ON CONFLICT (code) DO NOTHING;

-- Insert Leagues using subqueries for sport_id
INSERT INTO leagues (name, sport_id, country, season, is_active)
SELECT 'La Liga', id, 'España', '2024-2025', true FROM sports WHERE code = 'football'
UNION ALL
SELECT 'Premier League', id, 'Inglaterra', '2024-2025', true FROM sports WHERE code = 'football'
UNION ALL
SELECT 'NBA', id, 'Estados Unidos', '2024-2025', true FROM sports WHERE code = 'basketball'
UNION ALL
SELECT 'Fórmula 1', id, 'Mundial', '2024', true FROM sports WHERE code = 'f1'
ON CONFLICT DO NOTHING;

-- Insert Football Teams
INSERT INTO teams (name, short_name, sport_id, country, is_active)
SELECT t.name, t.short_name, s.id, t.country, true
FROM sports s, (VALUES
    ('FC Barcelona', 'BAR', 'España'),
    ('Real Madrid', 'RMA', 'España'),
    ('Atlético Madrid', 'ATM', 'España'),
    ('Sevilla FC', 'SEV', 'España'),
    ('Manchester City', 'MCI', 'Inglaterra'),
    ('Arsenal FC', 'ARS', 'Inglaterra'),
    ('Liverpool FC', 'LIV', 'Inglaterra'),
    ('Chelsea FC', 'CHE', 'Inglaterra')
) AS t(name, short_name, country)
WHERE s.code = 'football'
ON CONFLICT DO NOTHING;

-- Insert F1 Teams
INSERT INTO teams (name, short_name, sport_id, country, is_active)
SELECT t.name, t.short_name, s.id, t.country, true
FROM sports s, (VALUES
    ('Red Bull Racing', 'RBR', 'Austria'),
    ('Scuderia Ferrari', 'FER', 'Italia'),
    ('Mercedes-AMG', 'MER', 'Alemania')
) AS t(name, short_name, country)
WHERE s.code = 'f1'
ON CONFLICT DO NOTHING;

-- Insert Football Matches
INSERT INTO matches (league_id, sport_id, home_team_id, away_team_id, match_date, location, round, status, predictions_locked, lock_date)
SELECT 
    l.id,
    l.sport_id,
    (SELECT id FROM teams WHERE short_name = home),
    (SELECT id FROM teams WHERE short_name = away),
    NOW() + (days || ' days')::INTERVAL,
    location,
    round_name,
    'scheduled',
    false,
    NOW() + (days || ' days')::INTERVAL - INTERVAL '15 minutes'
FROM leagues l, (VALUES
    ('BAR', 'RMA', 2, 'Camp Nou, Barcelona', 'Jornada 25'),
    ('ATM', 'SEV', 3, 'Cívitas Metropolitano, Madrid', 'Jornada 25'),
    ('SEV', 'BAR', 5, 'Ramón Sánchez-Pizjuán, Sevilla', 'Jornada 26'),
    ('RMA', 'ATM', 6, 'Santiago Bernabéu, Madrid', 'Jornada 26')
) AS m(home, away, days, location, round_name)
WHERE l.name = 'La Liga'
ON CONFLICT DO NOTHING;

-- Insert F1 Matches
INSERT INTO matches (league_id, sport_id, match_date, location, round, status, predictions_locked, lock_date)
SELECT 
    l.id,
    l.sport_id,
    NOW() + (days || ' days')::INTERVAL,
    location,
    round_name,
    'scheduled',
    false,
    NOW() + (days || ' days')::INTERVAL - INTERVAL '1 hour'
FROM leagues l, (VALUES
    (7, 'Circuito de Mónaco, Mónaco', 'GP de Mónaco'),
    (14, 'Circuit de Barcelona-Catalunya, España', 'GP de España')
) AS m(days, location, round_name)
WHERE l.name = 'Fórmula 1'
ON CONFLICT DO NOTHING;

-- Create Users (password: test123 for all test users, admin123 for admin)
-- Hashes generated with: bcrypt.hash('password', 10)
INSERT INTO users (email, username, password, role, email_verified, auth_provider, is_active, total_points)
VALUES 
('admin@mastersport.app', 'Admin Master Sport', '$2a$10$m/HYm9mzFdAzEyPzpEM2wOheXpxXe1l./Ez5eCp9uxvqH85o5jYnW', 'super_admin', true, 'local', true, 0),
('test@test.com', 'Test User', '$2a$10$vqp1Hxx89ug6.BkezRM1s.cbKh6i9aHO.cS7HiDmecXG6K7rYrAB2', 'user', true, 'local', true, 1250),
('user1@test.com', 'Usuario Uno', '$2a$10$vqp1Hxx89ug6.BkezRM1s.cbKh6i9aHO.cS7HiDmecXG6K7rYrAB2', 'user', true, 'local', true, 850),
('user2@test.com', 'Usuario Dos', '$2a$10$vqp1Hxx89ug6.BkezRM1s.cbKh6i9aHO.cS7HiDmecXG6K7rYrAB2', 'user', true, 'local', true, 620)
ON CONFLICT (email) DO NOTHING;

-- Create Sample Groups
INSERT INTO groups (name, code, description, owner_id, is_private, max_members)
SELECT 'Liga de Amigos', 'AMIGOS2024', 'Grupo para predicciones entre amigos', id, false, 50
FROM users WHERE email = 'test@test.com'
ON CONFLICT (code) DO NOTHING;

INSERT INTO groups (name, code, description, owner_id, is_private, max_members)
SELECT 'Expertos en Fútbol', 'FUTBOL2024', 'Solo para verdaderos conocedores del fútbol', id, true, 25
FROM users WHERE email = 'admin@mastersport.app'
ON CONFLICT (code) DO NOTHING;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Database seeded successfully!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Users created:';
    RAISE NOTICE '  - admin@mastersport.app (password: admin123)';
    RAISE NOTICE '  - test@test.com (password: test123)';
    RAISE NOTICE '  - user1@test.com (password: test123)';
    RAISE NOTICE '  - user2@test.com (password: test123)';
    RAISE NOTICE '';
    RAISE NOTICE 'Data Summary:';
    RAISE NOTICE '  Sports: %', (SELECT COUNT(*) FROM sports);
    RAISE NOTICE '  Leagues: %', (SELECT COUNT(*) FROM leagues);
    RAISE NOTICE '  Teams: %', (SELECT COUNT(*) FROM teams);
    RAISE NOTICE '  Matches: %', (SELECT COUNT(*) FROM matches);
    RAISE NOTICE '  Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '  Groups: %', (SELECT COUNT(*) FROM groups);
    RAISE NOTICE '===========================================';
END $$;
