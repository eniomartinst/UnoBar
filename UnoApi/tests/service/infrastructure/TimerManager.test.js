import { jest } from '@jest/globals';
import TimerManager from '../../../service/infrastructure/TimerManager.js';

describe('TimerManager', () => {
  beforeEach(() => {
    TimerManager.turnTimers = {};
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('deve iniciar um timer com sucesso', () => {
    const callback = jest.fn();
    TimerManager.start(1, 0, callback);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10500);
  });

  it('deve executar o callback quando o tempo estourar', async () => {
    const callback = jest.fn();
    TimerManager.start(1, 2, callback);

    // Avança o tempo virtual do Jest em 11 segundos
    jest.advanceTimersByTime(11000);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(1, 2);
  });

  it('deve limpar o timer corretamente', () => {
    TimerManager.start(1, 0, jest.fn());
    TimerManager.clear(1);

    expect(clearTimeout).toHaveBeenCalledTimes(1);
  });
});