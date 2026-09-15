class TimerManager {
  constructor() {
    this.turnTimers = {};
    this.GRACE_PERIOD_MS = 10500; // 10.5 segundos
  }

  clear(gameId) {
    if (this.turnTimers[gameId]) {
      clearTimeout(this.turnTimers[gameId]);
      delete this.turnTimers[gameId];
    }
  }

  /**
   * Inicia a contagem. O callback é executado apenas se o tempo estourar.
   */
  start(gameId, expectedPlayerIndex, onTimeoutCallback) {
    this.clear(gameId);
    console.log(`[TimerManager] Iniciando 10s na sala ${gameId} para o jogador #${expectedPlayerIndex}`);

    this.turnTimers[gameId] = setTimeout(async () => {
      console.log(`[TimerManager] TEMPO ESGOTADO na sala ${gameId}! Executando callback...`);
      await onTimeoutCallback(gameId, expectedPlayerIndex);
    }, this.GRACE_PERIOD_MS);
  }
}

export default new TimerManager();