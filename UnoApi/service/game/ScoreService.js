import Score from '../repository/Score.js';
import Game from '../repository/Game.js';
import User from '../repository/User.js';
import NotFoundException from '../config/exceptions/NotFoundException.js';

class ScoreService {
  // ─── CRUD base ─────────────────────────────────────────────────────────────
  async create(data) { return await Score.create(data); }
  async findAll() { return await Score.findAll(); }

  async update(id, data) {
    const existingScore = await Score.findByPk(id);
    if (!existingScore) throw new NotFoundException(`Pontuação com ID ${id} não encontrada.`);
    await Score.update(data, { where: { id } });
    return await Score.findByPk(id);
  }

  async delete(id) {
    const existingScore = await Score.findByPk(id);
    if (!existingScore) throw new NotFoundException(`Pontuação com ID ${id} não encontrada.`);
    await Score.destroy({ where: { id } });
    return true;
  }

  // ─── Fluxo 3: Game Loop — Pontuação ────────────────────────────────────────

  /**
   * addPoints :: (gameId, username, points) -> Promise<totalScores>
   *
   * Realiza upsert dos pontos do vencedor de uma rodada:
   *   1. Busca o User pelo username para obter o playerId (FK)
   *   2. Faz upsert no modelo Score (cria ou acumula)
   *   3. Atualiza o campo totalScores (JSON) no Game para consulta rápida
   *
   * Retorna o mapa atualizado { username -> totalPoints }.
   */
  async addPoints(gameId, username, points) {
    // 1. Resolve userId pelo username
    const user = await User.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`Usuário "${username}" não encontrado.`);

    // 2. Upsert no modelo Score (busca existente ou cria novo registro)
    const existing = await Score.findOne({ where: { gameId, playerId: user.id } });
    if (existing) {
      await Score.update(
        { totalPoints: existing.totalPoints + points },
        { where: { id: existing.id } }
      );
    } else {
      await Score.create({ gameId, playerId: user.id, totalPoints: points });
    }

    // 3. Atualiza o campo JSON totalScores no Game (consulta rápida pelo socket)
    const game = await Game.findByPk(gameId);
    const totalScores = { ...(game.totalScores || {}) };
    totalScores[username] = (totalScores[username] || 0) + points;
    await Game.update({ totalScores }, { where: { id: gameId } });

    return totalScores; // retorna o mapa atualizado para o caller usar no broadcast
  }

  /**
   * checkGameWinner :: (gameId, threshold?) -> Promise<username | null>
   *
   * Verifica se algum jogador atingiu o limiar de pontos (padrão: 500).
   * Retorna o username do vencedor ou null se o jogo ainda continua.
   */
  async checkGameWinner(gameId, threshold = 500) {
    const game = await Game.findByPk(gameId);
    const totalScores = game?.totalScores || {};

    // HOF: find sobre as entradas do mapa de pontuação
    const winner = Object.entries(totalScores).find(([, pts]) => pts >= threshold);
    return winner ? winner[0] : null;
  }
}

export default new ScoreService();