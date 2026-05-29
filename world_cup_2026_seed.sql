-- ============================================================
-- SEED: FIFA World Cup 2026
-- Requiere: init.sql + add_tournament_tables.sql ejecutados antes
-- Columna sports: code (no short_name)
-- ============================================================

DO $$
DECLARE
  v_football UUID;
  v_league   UUID;
  v_admin    UUID;

  -- Equipos
  t_mex UUID; t_rsa UUID; t_kor UUID; t_cze UUID;
  t_can UUID; t_bih UUID; t_qat UUID; t_sui UUID;
  t_bra UUID; t_mar UUID; t_hai UUID; t_sco UUID;
  t_usa UUID; t_par UUID; t_aus UUID; t_tur UUID;
  t_ger UUID; t_cuw UUID; t_civ UUID; t_ecu UUID;
  t_ned UUID; t_jpn UUID; t_swe UUID; t_tun UUID;
  t_bel UUID; t_egy UUID; t_irn UUID; t_nzl UUID;
  t_esp UUID; t_cpv UUID; t_ksa UUID; t_uru UUID;
  t_fra UUID; t_sen UUID; t_irq UUID; t_nor UUID;
  t_arg UUID; t_alg UUID; t_aut UUID; t_jor UUID;
  t_por UUID; t_cod UUID; t_uzb UUID; t_col UUID;
  t_eng UUID; t_cro UUID; t_gha UUID; t_pan UUID;

  -- Rondas Grupo A
  rA1 UUID; rA2 UUID; rA3 UUID;
  -- Grupo B
  rB1 UUID; rB2 UUID; rB3 UUID;
  -- Grupo C
  rC1 UUID; rC2 UUID; rC3 UUID;
  -- Grupo D
  rD1 UUID; rD2 UUID; rD3 UUID;
  -- Grupo E
  rE1 UUID; rE2 UUID; rE3 UUID;
  -- Grupo F
  rF1 UUID; rF2 UUID; rF3 UUID;
  -- Grupo G
  rG1 UUID; rG2 UUID; rG3 UUID;
  -- Grupo H
  rH1 UUID; rH2 UUID; rH3 UUID;
  -- Grupo I
  rI1 UUID; rI2 UUID; rI3 UUID;
  -- Grupo J
  rJ1 UUID; rJ2 UUID; rJ3 UUID;
  -- Grupo K
  rK1 UUID; rK2 UUID; rK3 UUID;
  -- Grupo L
  rL1 UUID; rL2 UUID; rL3 UUID;
  -- Eliminatorias
  r_r32 UUID; r_r16 UUID; r_qf UUID; r_sf UUID; r_tp UUID; r_fin UUID;

BEGIN

  -- ───────────────────────────────────────────────
  -- 1. DEPORTE: Fútbol (ya creado en database_seed.sql, code='football')
  -- ───────────────────────────────────────────────
  SELECT id INTO v_football FROM sports WHERE code = 'football' LIMIT 1;
  IF v_football IS NULL THEN
    -- Si no existe, crearlo (entorno fresh)
    INSERT INTO sports (name, code, icon, prediction_type, scoring_rules, is_active, created_at, updated_at)
    VALUES ('Fútbol', 'football', 'sports_soccer', 'score',
      '{"exact_score":10,"correct_winner":5,"correct_draw":5,"home_goal_bonus":2,"away_goal_bonus":2,"strict_winner":true}',
      true, NOW(), NOW())
    ON CONFLICT (code) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_football;
  END IF;

  -- ───────────────────────────────────────────────
  -- 2. LIGA: FIFA World Cup 2026
  -- ───────────────────────────────────────────────
  SELECT id INTO v_league FROM leagues WHERE name = 'FIFA World Cup 2026' LIMIT 1;
  IF v_league IS NULL THEN
    INSERT INTO leagues (name, sport_id, country, season, is_active, created_at, updated_at)
    VALUES ('FIFA World Cup 2026', v_football, 'Internacional', '2026', true, NOW(), NOW())
    RETURNING id INTO v_league;
  END IF;

  -- ───────────────────────────────────────────────
  -- 3. EQUIPOS (48 selecciones)
  -- ───────────────────────────────────────────────
  -- Grupo A
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('México','MEX',v_football,'México',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_mex;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Sudáfrica','RSA',v_football,'Sudáfrica',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_rsa;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Corea del Sur','KOR',v_football,'Corea del Sur',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_kor;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Chequia','CZE',v_football,'República Checa',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_cze;
  -- Grupo B
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Canadá','CAN',v_football,'Canadá',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_can;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Bosnia Herzegovina','BIH',v_football,'Bosnia Herzegovina',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_bih;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Qatar','QAT',v_football,'Qatar',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_qat;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Suiza','SUI',v_football,'Suiza',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_sui;
  -- Grupo C
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Brasil','BRA',v_football,'Brasil',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_bra;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Marruecos','MAR',v_football,'Marruecos',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_mar;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Haití','HAI',v_football,'Haití',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_hai;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Escocia','SCO',v_football,'Escocia',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_sco;
  -- Grupo D
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Estados Unidos','USA',v_football,'Estados Unidos',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_usa;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Paraguay','PAR',v_football,'Paraguay',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_par;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Australia','AUS',v_football,'Australia',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_aus;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Turquía','TUR',v_football,'Turquía',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_tur;
  -- Grupo E
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Alemania','GER',v_football,'Alemania',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_ger;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Curazao','CUW',v_football,'Curazao',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_cuw;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Costa de Marfil','CIV',v_football,'Costa de Marfil',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_civ;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Ecuador','ECU',v_football,'Ecuador',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_ecu;
  -- Grupo F
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Países Bajos','NED',v_football,'Países Bajos',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_ned;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Japón','JPN',v_football,'Japón',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_jpn;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Suecia','SWE',v_football,'Suecia',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_swe;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Túnez','TUN',v_football,'Túnez',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_tun;
  -- Grupo G
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Bélgica','BEL',v_football,'Bélgica',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_bel;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Egipto','EGY',v_football,'Egipto',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_egy;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Irán','IRN',v_football,'Irán',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_irn;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Nueva Zelanda','NZL',v_football,'Nueva Zelanda',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_nzl;
  -- Grupo H
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('España','ESP',v_football,'España',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_esp;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Cabo Verde','CPV',v_football,'Cabo Verde',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_cpv;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Arabia Saudita','KSA',v_football,'Arabia Saudita',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_ksa;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Uruguay','URU',v_football,'Uruguay',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_uru;
  -- Grupo I
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Francia','FRA',v_football,'Francia',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_fra;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Senegal','SEN',v_football,'Senegal',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_sen;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Irak','IRQ',v_football,'Irak',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_irq;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Noruega','NOR',v_football,'Noruega',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_nor;
  -- Grupo J
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Argentina','ARG',v_football,'Argentina',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_arg;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Argelia','ALG',v_football,'Argelia',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_alg;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Austria','AUT',v_football,'Austria',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_aut;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Jordania','JOR',v_football,'Jordania',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_jor;
  -- Grupo K
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Portugal','POR',v_football,'Portugal',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_por;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Rep. D. Congo','COD',v_football,'Rep. D. Congo',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_cod;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Uzbekistán','UZB',v_football,'Uzbekistán',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_uzb;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Colombia','COL',v_football,'Colombia',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_col;
  -- Grupo L
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Inglaterra','ENG',v_football,'Inglaterra',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_eng;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Croacia','CRO',v_football,'Croacia',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_cro;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Ghana','GHA',v_football,'Ghana',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_gha;
  INSERT INTO teams (name, short_name, sport_id, country, is_active, created_at, updated_at) VALUES ('Panamá','PAN',v_football,'Panamá',true,NOW(),NOW()) ON CONFLICT (short_name) DO UPDATE SET updated_at=NOW() RETURNING id INTO t_pan;

  -- ───────────────────────────────────────────────
  -- 4. RONDAS — Fase de grupos (12 grupos × 3 jornadas)
  -- ───────────────────────────────────────────────
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo A - Jornada 1','group_stage',1,'2026-06-11','2026-06-11',true,'{"group":"A","matchday":1}',NOW(),NOW()) RETURNING id INTO rA1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo A - Jornada 2','group_stage',2,'2026-06-15','2026-06-15',true,'{"group":"A","matchday":2}',NOW(),NOW()) RETURNING id INTO rA2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo A - Jornada 3','group_stage',3,'2026-06-19','2026-06-19',true,'{"group":"A","matchday":3}',NOW(),NOW()) RETURNING id INTO rA3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo B - Jornada 1','group_stage',1,'2026-06-11','2026-06-11',true,'{"group":"B","matchday":1}',NOW(),NOW()) RETURNING id INTO rB1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo B - Jornada 2','group_stage',2,'2026-06-15','2026-06-15',true,'{"group":"B","matchday":2}',NOW(),NOW()) RETURNING id INTO rB2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo B - Jornada 3','group_stage',3,'2026-06-20','2026-06-20',true,'{"group":"B","matchday":3}',NOW(),NOW()) RETURNING id INTO rB3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo C - Jornada 1','group_stage',1,'2026-06-12','2026-06-12',true,'{"group":"C","matchday":1}',NOW(),NOW()) RETURNING id INTO rC1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo C - Jornada 2','group_stage',2,'2026-06-16','2026-06-16',true,'{"group":"C","matchday":2}',NOW(),NOW()) RETURNING id INTO rC2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo C - Jornada 3','group_stage',3,'2026-06-20','2026-06-20',true,'{"group":"C","matchday":3}',NOW(),NOW()) RETURNING id INTO rC3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo D - Jornada 1','group_stage',1,'2026-06-12','2026-06-12',true,'{"group":"D","matchday":1}',NOW(),NOW()) RETURNING id INTO rD1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo D - Jornada 2','group_stage',2,'2026-06-16','2026-06-16',true,'{"group":"D","matchday":2}',NOW(),NOW()) RETURNING id INTO rD2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo D - Jornada 3','group_stage',3,'2026-06-21','2026-06-21',true,'{"group":"D","matchday":3}',NOW(),NOW()) RETURNING id INTO rD3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo E - Jornada 1','group_stage',1,'2026-06-13','2026-06-13',true,'{"group":"E","matchday":1}',NOW(),NOW()) RETURNING id INTO rE1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo E - Jornada 2','group_stage',2,'2026-06-17','2026-06-17',true,'{"group":"E","matchday":2}',NOW(),NOW()) RETURNING id INTO rE2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo E - Jornada 3','group_stage',3,'2026-06-21','2026-06-21',true,'{"group":"E","matchday":3}',NOW(),NOW()) RETURNING id INTO rE3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo F - Jornada 1','group_stage',1,'2026-06-13','2026-06-13',true,'{"group":"F","matchday":1}',NOW(),NOW()) RETURNING id INTO rF1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo F - Jornada 2','group_stage',2,'2026-06-17','2026-06-17',true,'{"group":"F","matchday":2}',NOW(),NOW()) RETURNING id INTO rF2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo F - Jornada 3','group_stage',3,'2026-06-22','2026-06-22',true,'{"group":"F","matchday":3}',NOW(),NOW()) RETURNING id INTO rF3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo G - Jornada 1','group_stage',1,'2026-06-14','2026-06-14',true,'{"group":"G","matchday":1}',NOW(),NOW()) RETURNING id INTO rG1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo G - Jornada 2','group_stage',2,'2026-06-18','2026-06-18',true,'{"group":"G","matchday":2}',NOW(),NOW()) RETURNING id INTO rG2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo G - Jornada 3','group_stage',3,'2026-06-22','2026-06-22',true,'{"group":"G","matchday":3}',NOW(),NOW()) RETURNING id INTO rG3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo H - Jornada 1','group_stage',1,'2026-06-14','2026-06-14',true,'{"group":"H","matchday":1}',NOW(),NOW()) RETURNING id INTO rH1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo H - Jornada 2','group_stage',2,'2026-06-18','2026-06-18',true,'{"group":"H","matchday":2}',NOW(),NOW()) RETURNING id INTO rH2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo H - Jornada 3','group_stage',3,'2026-06-23','2026-06-23',true,'{"group":"H","matchday":3}',NOW(),NOW()) RETURNING id INTO rH3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo I - Jornada 1','group_stage',1,'2026-06-11','2026-06-11',true,'{"group":"I","matchday":1}',NOW(),NOW()) RETURNING id INTO rI1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo I - Jornada 2','group_stage',2,'2026-06-15','2026-06-15',true,'{"group":"I","matchday":2}',NOW(),NOW()) RETURNING id INTO rI2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo I - Jornada 3','group_stage',3,'2026-06-19','2026-06-19',true,'{"group":"I","matchday":3}',NOW(),NOW()) RETURNING id INTO rI3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo J - Jornada 1','group_stage',1,'2026-06-12','2026-06-12',true,'{"group":"J","matchday":1}',NOW(),NOW()) RETURNING id INTO rJ1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo J - Jornada 2','group_stage',2,'2026-06-16','2026-06-16',true,'{"group":"J","matchday":2}',NOW(),NOW()) RETURNING id INTO rJ2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo J - Jornada 3','group_stage',3,'2026-06-20','2026-06-20',true,'{"group":"J","matchday":3}',NOW(),NOW()) RETURNING id INTO rJ3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo K - Jornada 1','group_stage',1,'2026-06-13','2026-06-13',true,'{"group":"K","matchday":1}',NOW(),NOW()) RETURNING id INTO rK1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo K - Jornada 2','group_stage',2,'2026-06-17','2026-06-17',true,'{"group":"K","matchday":2}',NOW(),NOW()) RETURNING id INTO rK2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo K - Jornada 3','group_stage',3,'2026-06-21','2026-06-21',true,'{"group":"K","matchday":3}',NOW(),NOW()) RETURNING id INTO rK3;

  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo L - Jornada 1','group_stage',1,'2026-06-14','2026-06-14',true,'{"group":"L","matchday":1}',NOW(),NOW()) RETURNING id INTO rL1;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo L - Jornada 2','group_stage',2,'2026-06-18','2026-06-18',true,'{"group":"L","matchday":2}',NOW(),NOW()) RETURNING id INTO rL2;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Grupo L - Jornada 3','group_stage',3,'2026-06-22','2026-06-22',true,'{"group":"L","matchday":3}',NOW(),NOW()) RETURNING id INTO rL3;

  -- Eliminatorias
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Ronda de 32','round_of_32',4,'2026-06-27','2026-07-02',true,'{}',NOW(),NOW()) RETURNING id INTO r_r32;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Octavos de Final','round_of_16',5,'2026-07-03','2026-07-06',true,'{}',NOW(),NOW()) RETURNING id INTO r_r16;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Cuartos de Final','quarterfinal',6,'2026-07-09','2026-07-11',true,'{}',NOW(),NOW()) RETURNING id INTO r_qf;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Semifinales','semifinal',7,'2026-07-14','2026-07-15',true,'{}',NOW(),NOW()) RETURNING id INTO r_sf;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Tercer Puesto','final',8,'2026-07-18','2026-07-18',true,'{"is_third_place":true}',NOW(),NOW()) RETURNING id INTO r_tp;
  INSERT INTO rounds (league_id,sport_id,name,round_type,round_number,start_date,end_date,is_active,metadata,created_at,updated_at) VALUES (v_league,v_football,'Gran Final','final',9,'2026-07-19','2026-07-19',true,'{}',NOW(),NOW()) RETURNING id INTO r_fin;

  -- ───────────────────────────────────────────────
  -- 5. PARTIDOS — 72 partidos de fase de grupos
  -- Jornada 1: equipo1 vs equipo4, equipo2 vs equipo3
  -- Jornada 2: equipo1 vs equipo3, equipo2 vs equipo4
  -- Jornada 3: equipo1 vs equipo2, equipo3 vs equipo4 (simultáneos)
  -- ───────────────────────────────────────────────

  -- GRUPO A: México(1) Sudáfrica(2) Corea(3) Chequia(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rA1,t_mex,t_cze,'2026-06-11 19:00:00+00','scheduled',false,'Grupo A - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rA1,t_rsa,t_kor,'2026-06-11 22:00:00+00','scheduled',false,'Grupo A - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rA2,t_mex,t_kor,'2026-06-15 19:00:00+00','scheduled',false,'Grupo A - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rA2,t_cze,t_rsa,'2026-06-15 22:00:00+00','scheduled',false,'Grupo A - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rA3,t_mex,t_rsa,'2026-06-19 18:00:00+00','scheduled',false,'Grupo A - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rA3,t_kor,t_cze,'2026-06-19 18:00:00+00','scheduled',false,'Grupo A - Jornada 3',NOW(),NOW());

  -- GRUPO B: Canadá(1) Bosnia(2) Qatar(3) Suiza(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rB1,t_can,t_sui,'2026-06-12 01:00:00+00','scheduled',false,'Grupo B - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rB1,t_bih,t_qat,'2026-06-12 04:00:00+00','scheduled',false,'Grupo B - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rB2,t_can,t_qat,'2026-06-16 01:00:00+00','scheduled',false,'Grupo B - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rB2,t_sui,t_bih,'2026-06-16 04:00:00+00','scheduled',false,'Grupo B - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rB3,t_can,t_bih,'2026-06-20 22:00:00+00','scheduled',false,'Grupo B - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rB3,t_sui,t_qat,'2026-06-20 22:00:00+00','scheduled',false,'Grupo B - Jornada 3',NOW(),NOW());

  -- GRUPO C: Brasil(1) Marruecos(2) Haití(3) Escocia(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rC1,t_bra,t_sco,'2026-06-12 19:00:00+00','scheduled',false,'Grupo C - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rC1,t_mar,t_hai,'2026-06-12 22:00:00+00','scheduled',false,'Grupo C - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rC2,t_bra,t_hai,'2026-06-16 19:00:00+00','scheduled',false,'Grupo C - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rC2,t_sco,t_mar,'2026-06-16 22:00:00+00','scheduled',false,'Grupo C - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rC3,t_bra,t_mar,'2026-06-20 21:00:00+00','scheduled',false,'Grupo C - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rC3,t_sco,t_hai,'2026-06-20 21:00:00+00','scheduled',false,'Grupo C - Jornada 3',NOW(),NOW());

  -- GRUPO D: EE.UU.(1) Paraguay(2) Australia(3) Turquía(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rD1,t_usa,t_tur,'2026-06-13 01:00:00+00','scheduled',false,'Grupo D - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rD1,t_par,t_aus,'2026-06-13 04:00:00+00','scheduled',false,'Grupo D - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rD2,t_usa,t_aus,'2026-06-17 01:00:00+00','scheduled',false,'Grupo D - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rD2,t_tur,t_par,'2026-06-17 04:00:00+00','scheduled',false,'Grupo D - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rD3,t_usa,t_par,'2026-06-21 22:00:00+00','scheduled',false,'Grupo D - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rD3,t_tur,t_aus,'2026-06-21 22:00:00+00','scheduled',false,'Grupo D - Jornada 3',NOW(),NOW());

  -- GRUPO E: Alemania(1) Curazao(2) C.Marfil(3) Ecuador(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rE1,t_ger,t_ecu,'2026-06-13 19:00:00+00','scheduled',false,'Grupo E - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rE1,t_cuw,t_civ,'2026-06-13 22:00:00+00','scheduled',false,'Grupo E - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rE2,t_ger,t_civ,'2026-06-17 19:00:00+00','scheduled',false,'Grupo E - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rE2,t_ecu,t_cuw,'2026-06-17 22:00:00+00','scheduled',false,'Grupo E - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rE3,t_ger,t_cuw,'2026-06-21 21:00:00+00','scheduled',false,'Grupo E - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rE3,t_civ,t_ecu,'2026-06-21 21:00:00+00','scheduled',false,'Grupo E - Jornada 3',NOW(),NOW());

  -- GRUPO F: P.Bajos(1) Japón(2) Suecia(3) Túnez(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rF1,t_ned,t_tun,'2026-06-14 01:00:00+00','scheduled',false,'Grupo F - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rF1,t_jpn,t_swe,'2026-06-14 04:00:00+00','scheduled',false,'Grupo F - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rF2,t_ned,t_swe,'2026-06-18 01:00:00+00','scheduled',false,'Grupo F - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rF2,t_tun,t_jpn,'2026-06-18 04:00:00+00','scheduled',false,'Grupo F - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rF3,t_ned,t_jpn,'2026-06-22 22:00:00+00','scheduled',false,'Grupo F - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rF3,t_swe,t_tun,'2026-06-22 22:00:00+00','scheduled',false,'Grupo F - Jornada 3',NOW(),NOW());

  -- GRUPO G: Bélgica(1) Egipto(2) Irán(3) N.Zelanda(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rG1,t_bel,t_nzl,'2026-06-14 19:00:00+00','scheduled',false,'Grupo G - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rG1,t_egy,t_irn,'2026-06-14 22:00:00+00','scheduled',false,'Grupo G - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rG2,t_bel,t_irn,'2026-06-18 19:00:00+00','scheduled',false,'Grupo G - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rG2,t_nzl,t_egy,'2026-06-18 22:00:00+00','scheduled',false,'Grupo G - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rG3,t_bel,t_egy,'2026-06-22 21:00:00+00','scheduled',false,'Grupo G - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rG3,t_nzl,t_irn,'2026-06-22 21:00:00+00','scheduled',false,'Grupo G - Jornada 3',NOW(),NOW());

  -- GRUPO H: España(1) Cabo Verde(2) A.Saudita(3) Uruguay(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rH1,t_esp,t_cpv,'2026-06-15 01:00:00+00','scheduled',false,'Grupo H - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rH1,t_uru,t_ksa,'2026-06-15 04:00:00+00','scheduled',false,'Grupo H - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rH2,t_esp,t_ksa,'2026-06-19 01:00:00+00','scheduled',false,'Grupo H - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rH2,t_cpv,t_uru,'2026-06-19 04:00:00+00','scheduled',false,'Grupo H - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rH3,t_esp,t_uru,'2026-06-23 22:00:00+00','scheduled',false,'Grupo H - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rH3,t_ksa,t_cpv,'2026-06-23 22:00:00+00','scheduled',false,'Grupo H - Jornada 3',NOW(),NOW());

  -- GRUPO I: Francia(1) Senegal(2) Irak(3) Noruega(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rI1,t_fra,t_nor,'2026-06-11 23:00:00+00','scheduled',false,'Grupo I - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rI1,t_sen,t_irq,'2026-06-12 02:00:00+00','scheduled',false,'Grupo I - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rI2,t_fra,t_irq,'2026-06-15 23:00:00+00','scheduled',false,'Grupo I - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rI2,t_nor,t_sen,'2026-06-16 02:00:00+00','scheduled',false,'Grupo I - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rI3,t_fra,t_sen,'2026-06-19 21:00:00+00','scheduled',false,'Grupo I - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rI3,t_irq,t_nor,'2026-06-19 21:00:00+00','scheduled',false,'Grupo I - Jornada 3',NOW(),NOW());

  -- GRUPO J: Argentina(1) Argelia(2) Austria(3) Jordania(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rJ1,t_arg,t_jor,'2026-06-13 02:00:00+00','scheduled',false,'Grupo J - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rJ1,t_alg,t_aut,'2026-06-12 23:00:00+00','scheduled',false,'Grupo J - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rJ2,t_arg,t_aut,'2026-06-17 02:00:00+00','scheduled',false,'Grupo J - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rJ2,t_jor,t_alg,'2026-06-16 23:00:00+00','scheduled',false,'Grupo J - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rJ3,t_arg,t_alg,'2026-06-20 21:00:00+00','scheduled',false,'Grupo J - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rJ3,t_aut,t_jor,'2026-06-20 21:00:00+00','scheduled',false,'Grupo J - Jornada 3',NOW(),NOW());

  -- GRUPO K: Portugal(1) Congo(2) Uzbekistán(3) Colombia(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rK1,t_por,t_uzb,'2026-06-14 02:00:00+00','scheduled',false,'Grupo K - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rK1,t_col,t_cod,'2026-06-13 23:00:00+00','scheduled',false,'Grupo K - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rK2,t_por,t_cod,'2026-06-18 02:00:00+00','scheduled',false,'Grupo K - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rK2,t_uzb,t_col,'2026-06-17 23:00:00+00','scheduled',false,'Grupo K - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rK3,t_por,t_col,'2026-06-21 21:00:00+00','scheduled',false,'Grupo K - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rK3,t_cod,t_uzb,'2026-06-21 21:00:00+00','scheduled',false,'Grupo K - Jornada 3',NOW(),NOW());

  -- GRUPO L: Inglaterra(1) Croacia(2) Ghana(3) Panamá(4)
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rL1,t_eng,t_pan,'2026-06-15 02:00:00+00','scheduled',false,'Grupo L - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rL1,t_cro,t_gha,'2026-06-14 23:00:00+00','scheduled',false,'Grupo L - Jornada 1',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rL2,t_eng,t_gha,'2026-06-19 02:00:00+00','scheduled',false,'Grupo L - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rL2,t_pan,t_cro,'2026-06-18 23:00:00+00','scheduled',false,'Grupo L - Jornada 2',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rL3,t_eng,t_cro,'2026-06-22 21:00:00+00','scheduled',false,'Grupo L - Jornada 3',NOW(),NOW());
  INSERT INTO matches (league_id,sport_id,round_id,home_team_id,away_team_id,match_date,status,predictions_locked,round,created_at,updated_at) VALUES (v_league,v_football,rL3,t_gha,t_pan,'2026-06-22 21:00:00+00','scheduled',false,'Grupo L - Jornada 3',NOW(),NOW());

  -- ───────────────────────────────────────────────
  -- 6. TORNEOS (Polla Pública + Privada)
  -- ───────────────────────────────────────────────
  SELECT id INTO v_admin FROM users WHERE role IN ('admin','super_admin') ORDER BY created_at LIMIT 1;
  IF v_admin IS NULL THEN
    SELECT id INTO v_admin FROM users ORDER BY created_at LIMIT 1;
  END IF;

  IF v_admin IS NOT NULL THEN
    -- Polla Pública
    IF NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'Polla Mundial 2026 - Pública') THEN
      INSERT INTO tournaments (name, description, league_id, type, access_code, status, start_date, end_date, champion_points, runner_up_points, third_place_points, scoring_rules, special_predictions_locked, created_by, created_at, updated_at)
      VALUES (
        'Polla Mundial 2026 - Pública',
        '¡Pronostica el FIFA World Cup 2026! Gratis para todos los usuarios.',
        v_league, 'public', NULL, 'upcoming',
        '2026-06-11 19:00:00+00', '2026-07-19 23:00:00+00',
        45, 35, 25,
        '{"exact_score":10,"correct_winner":5,"correct_draw":5,"home_goal_bonus":2,"away_goal_bonus":2,"strict_winner":true}',
        false, v_admin, NOW(), NOW()
      );
    END IF;

    -- Polla Privada
    IF NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'Polla Mundial 2026 - Privada') THEN
      INSERT INTO tournaments (name, description, league_id, type, access_code, status, start_date, end_date, champion_points, runner_up_points, third_place_points, scoring_rules, special_predictions_locked, created_by, created_at, updated_at)
      VALUES (
        'Polla Mundial 2026 - Privada',
        'Polla privada del Mundial 2026. Solo con código de acceso.',
        v_league, 'private', 'MUNDIAL26', 'upcoming',
        '2026-06-11 19:00:00+00', '2026-07-19 23:00:00+00',
        45, 35, 25,
        '{"exact_score":10,"correct_winner":5,"correct_draw":5,"home_goal_bonus":2,"away_goal_bonus":2,"strict_winner":true}',
        false, v_admin, NOW(), NOW()
      );
    END IF;
  END IF;

  RAISE NOTICE '✅ FIFA World Cup 2026 seed: 48 equipos, 72 partidos, 2 torneos creados.';
END $$;
