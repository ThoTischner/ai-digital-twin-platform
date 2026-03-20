import { useSimulationStore } from '../store/simulationStore'

/**
 * TimeManager — singleton that bridges wall-clock time to simulation time.
 * Reads speed multiplier and running state from the simulation store
 * and advances simulation time accordingly.
 */
export class TimeManager {
  private static instance: TimeManager | null = null

  private constructor() {}

  static getInstance(): TimeManager {
    if (!TimeManager.instance) {
      TimeManager.instance = new TimeManager()
    }
    return TimeManager.instance
  }

  /**
   * Compute the simulation delta for this frame.
   * Returns 0 when the simulation is paused.
   * Advances simulationStore.simulationTime by the computed delta.
   */
  tick(wallDeltaMs: number): number {
    const store = useSimulationStore.getState()

    if (!store.isRunning) {
      return 0
    }

    const simDeltaMs = wallDeltaMs * store.speedMultiplier

    store.advanceTime(wallDeltaMs)

    return simDeltaMs
  }
}
