// Servicio de scoring para eventos F1.
// Reglas por defecto (todas configurables por evento en points_config):
//   - exact_position: piloto en la posición exacta predicha (1..N)
//   - top10_hit: piloto que el usuario puso en top 10 quedó dentro del top 10 real (aunque no acierte la posición)
//   - podium_hit: piloto que el usuario puso en podio (P1..P3) quedó dentro del podio real
//   - pole, fastest_lap, driver_of_the_day: aciertos individuales
//   - retirements_exact / retirements_close (±1)

const DEFAULT_CONFIG = {
  exact_position: 5,
  top10_hit: 8,
  podium_hit: 7,
  pole: 5,
  fastest_lap: 5,
  driver_of_the_day: 5,
  retirements_exact: 10,
  retirements_close: 5,
};

const mergeConfig = (cfg) => ({ ...DEFAULT_CONFIG, ...(cfg || {}) });

// Devuelve { total, breakdown } para una predicción vs un resultado.
// - predictionPositions: array de driver_ids del usuario, índice 0 = P1.
// - resultPositions: array de driver_ids reales, índice 0 = P1.
const scorePrediction = (prediction, result, pointsConfig) => {
  const cfg = mergeConfig(pointsConfig);
  const predPositions = Array.isArray(prediction.positions) ? prediction.positions : [];
  const realPositions = Array.isArray(result.positions) ? result.positions : [];

  const realTop10 = new Set(realPositions.slice(0, 10).filter(Boolean));
  const realPodium = new Set(realPositions.slice(0, 3).filter(Boolean));

  let total = 0;
  const breakdown = {
    exact_position: 0,
    top10_hit: 0,
    podium_hit: 0,
    pole: 0,
    fastest_lap: 0,
    driver_of_the_day: 0,
    retirements: 0,
    details: {
      exact_positions: [], // [{ pos: 1, driver_id }]
      top10_hits: [],
      podium_hits: [],
    },
  };

  const contadoTop10 = new Set();
  const contadoPodium = new Set();

  for (let i = 0; i < predPositions.length; i += 1) {
    const predDriverId = predPositions[i];
    if (!predDriverId) continue;
    const realDriverId = realPositions[i];

    // Acierto de posición exacta
    if (realDriverId && predDriverId === realDriverId) {
      total += cfg.exact_position;
      breakdown.exact_position += cfg.exact_position;
      breakdown.details.exact_positions.push({ pos: i + 1, driver_id: predDriverId });
    }

    // Podio: si el usuario lo puso en P1..P3 y el piloto quedó en podio real
    if (i < 3 && realPodium.has(predDriverId) && !contadoPodium.has(predDriverId)) {
      total += cfg.podium_hit;
      breakdown.podium_hit += cfg.podium_hit;
      breakdown.details.podium_hits.push({ user_pos: i + 1, driver_id: predDriverId });
      contadoPodium.add(predDriverId);
    }

    // Top 10: si el usuario lo puso en top 10 y quedó en top 10 real
    if (i < 10 && realTop10.has(predDriverId) && !contadoTop10.has(predDriverId)) {
      total += cfg.top10_hit;
      breakdown.top10_hit += cfg.top10_hit;
      breakdown.details.top10_hits.push({ user_pos: i + 1, driver_id: predDriverId });
      contadoTop10.add(predDriverId);
    }
  }

  // Pole
  if (prediction.pole_driver_id && result.pole_driver_id && prediction.pole_driver_id === result.pole_driver_id) {
    total += cfg.pole;
    breakdown.pole = cfg.pole;
  }

  // Vuelta rápida
  if (prediction.fastest_lap_driver_id && result.fastest_lap_driver_id && prediction.fastest_lap_driver_id === result.fastest_lap_driver_id) {
    total += cfg.fastest_lap;
    breakdown.fastest_lap = cfg.fastest_lap;
  }

  // Piloto del día
  if (prediction.driver_of_the_day_id && result.driver_of_the_day_id && prediction.driver_of_the_day_id === result.driver_of_the_day_id) {
    total += cfg.driver_of_the_day;
    breakdown.driver_of_the_day = cfg.driver_of_the_day;
  }

  // Abandonos
  if (
    typeof prediction.retirements_count === 'number' &&
    typeof result.retirements_count === 'number'
  ) {
    const diff = Math.abs(prediction.retirements_count - result.retirements_count);
    if (diff === 0) {
      total += cfg.retirements_exact;
      breakdown.retirements = cfg.retirements_exact;
    } else if (diff === 1) {
      total += cfg.retirements_close;
      breakdown.retirements = cfg.retirements_close;
    }
  }

  return { total, breakdown };
};

module.exports = {
  DEFAULT_CONFIG,
  scorePrediction,
};
