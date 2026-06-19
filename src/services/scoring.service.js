/**
 * Reglas oficiales MASTERSPORTS para deportes basados en marcador (score).
 * Ganador: 5 | Goles local: 2 | Goles visitante: 2 | Exacto completo: 10 (reemplaza suma)
 */
const MASTER_SPORTS_SCORE_RULES = {
  exact_score: 10,
  correct_winner: 5,
  correct_draw: 5,
  home_goal_bonus: 2,
  away_goal_bonus: 2
};

class ScoringService {
  static getDefaultScoreRules() {
    return { ...MASTER_SPORTS_SCORE_RULES };
  }

  /**
   * Calcula puntos según reglas MASTERSPORTS.
   * @returns {{ points: number, isCorrect: boolean, invalid?: boolean, breakdown?: object }}
   */
  static calculateScorePoints(predData, match, scoringRules = {}) {
    const rules = { ...MASTER_SPORTS_SCORE_RULES, ...scoringRules };
    const {
      exact_score,
      correct_winner,
      correct_draw,
      home_goal_bonus,
      away_goal_bonus
    } = rules;

    const predHome = predData?.home_score;
    const predAway = predData?.away_score;
    const actualHome = match.home_score;
    const actualAway = match.away_score;

    if (
      predHome === undefined || predHome === null ||
      predAway === undefined || predAway === null ||
      actualHome === null || actualAway === null
    ) {
      return { points: 0, isCorrect: false, invalid: true };
    }

    const winnerCorrect = ScoringService._getResult(predHome, predAway) ===
      ScoringService._getResult(actualHome, actualAway);
    const homeCorrect = predHome === actualHome;
    const awayCorrect = predAway === actualAway;

    // Resultado exacto completo → 10 pts fijos (no acumula 5+2+2)
    if (homeCorrect && awayCorrect) {
      return {
        points: exact_score,
        isCorrect: true,
        breakdown: { winnerCorrect: true, homeCorrect: true, awayCorrect: true, exact: true }
      };
    }

    let points = 0;

    if (winnerCorrect) {
      points += ScoringService._getResult(actualHome, actualAway) === 'draw'
        ? correct_draw
        : correct_winner;
    }
    if (homeCorrect) points += home_goal_bonus;
    if (awayCorrect) points += away_goal_bonus;

    return {
      points,
      isCorrect: points > 0,
      breakdown: { winnerCorrect, homeCorrect, awayCorrect, exact: false }
    };
  }

  static _getResult(home, away) {
    if (home > away) return 'home';
    if (home < away) return 'away';
    return 'draw';
  }
}

module.exports = ScoringService;
module.exports.MASTER_SPORTS_SCORE_RULES = MASTER_SPORTS_SCORE_RULES;
