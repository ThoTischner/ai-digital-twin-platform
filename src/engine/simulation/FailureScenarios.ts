import { SCENARIOS } from '../../config/scenarioPresets'
import { FailureScenario, ScenarioPhase } from '../../types/scenario'

interface ActiveScenarioState {
  scenario: FailureScenario
  phaseIndex: number
  elapsed: number
  phaseElapsed: number
  restoring: boolean
  restoreElapsed: number
}

/** Duration in ms over which sensors gradually return to normal after stop() */
const RESTORE_DURATION_MS = 5000

/**
 * FailureScenarioManager — manages activation, phase progression,
 * and sensor effect interpolation for failure scenarios.
 */
export class FailureScenarioManager {
  private active: ActiveScenarioState | null = null
  private lastEffects: Record<string, {
    targetValue?: number
    rateOfChange?: number
    noiseMultiplier?: number
  }> = {}

  /**
   * Start a failure scenario by its ID.
   * Loads the scenario from the presets config and resets all tracking state.
   */
  start(scenarioId: string): void {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId)
    if (!scenario) {
      console.warn(`[FailureScenarioManager] Unknown scenario: ${scenarioId}`)
      return
    }

    this.active = {
      scenario,
      phaseIndex: 0,
      elapsed: 0,
      phaseElapsed: 0,
      restoring: false,
      restoreElapsed: 0,
    }
    this.lastEffects = {}
  }

  /**
   * Advance the active scenario by simDeltaMs and return the current
   * sensor effects with interpolation between phases.
   * Returns an empty object when no scenario is active.
   */
  update(simDeltaMs: number): Record<string, {
    targetValue?: number
    rateOfChange?: number
    noiseMultiplier?: number
  }> {
    if (!this.active) {
      return {}
    }

    // Handle gradual restoration after stop()
    if (this.active.restoring) {
      this.active.restoreElapsed += simDeltaMs
      const progress = Math.min(this.active.restoreElapsed / RESTORE_DURATION_MS, 1)

      if (progress >= 1) {
        this.active = null
        this.lastEffects = {}
        return {}
      }

      // Fade out the last effects toward zero influence
      const fadedEffects: Record<string, {
        targetValue?: number
        rateOfChange?: number
        noiseMultiplier?: number
      }> = {}

      for (const [sensorId, effect] of Object.entries(this.lastEffects)) {
        fadedEffects[sensorId] = {
          ...(effect.targetValue !== undefined
            ? { targetValue: undefined }
            : {}),
          rateOfChange: (effect.rateOfChange ?? 0) * (1 - progress),
          noiseMultiplier: 1 + ((effect.noiseMultiplier ?? 1) - 1) * (1 - progress),
        }
      }

      return fadedEffects
    }

    const { scenario } = this.active
    const phases = scenario.phases

    // Advance elapsed time
    this.active.elapsed += simDeltaMs
    this.active.phaseElapsed += simDeltaMs

    // Check for phase transitions
    const currentPhase = phases[this.active.phaseIndex]
    const phaseDurationMs = currentPhase.duration * 1000

    if (this.active.phaseElapsed >= phaseDurationMs) {
      if (this.active.phaseIndex < phases.length - 1) {
        this.active.phaseIndex++
        this.active.phaseElapsed -= phaseDurationMs
      }
      // If we're on the last phase, stay there
    }

    // Compute interpolated effects
    const phase = phases[this.active.phaseIndex]
    const phaseProgress = Math.min(this.active.phaseElapsed / (phase.duration * 1000), 1)

    // Get the previous phase effects (or empty for the first phase)
    const prevEffects: ScenarioPhase['sensorEffects'] =
      this.active.phaseIndex > 0
        ? phases[this.active.phaseIndex - 1].sensorEffects
        : {}

    const currentEffects: Record<string, {
      targetValue?: number
      rateOfChange?: number
      noiseMultiplier?: number
    }> = {}

    // Collect all affected sensor IDs across prev and current phase
    const allSensorIds = new Set([
      ...Object.keys(prevEffects),
      ...Object.keys(phase.sensorEffects),
    ])

    for (const sensorId of allSensorIds) {
      const prev = prevEffects[sensorId]
      const curr = phase.sensorEffects[sensorId]

      if (curr && prev) {
        // Interpolate between previous and current phase values
        currentEffects[sensorId] = {
          targetValue: lerpOpt(prev.targetValue, curr.targetValue, phaseProgress),
          rateOfChange: lerpOpt(prev.rateOfChange, curr.rateOfChange, phaseProgress),
          noiseMultiplier: lerpOpt(prev.noiseMultiplier, curr.noiseMultiplier, phaseProgress),
        }
      } else if (curr) {
        // New sensor in this phase — fade in
        currentEffects[sensorId] = {
          targetValue: curr.targetValue,
          rateOfChange: (curr.rateOfChange ?? 0) * phaseProgress,
          noiseMultiplier: curr.noiseMultiplier
            ? 1 + (curr.noiseMultiplier - 1) * phaseProgress
            : undefined,
        }
      } else if (prev) {
        // Sensor was in previous phase but not current — fade out
        currentEffects[sensorId] = {
          targetValue: undefined,
          rateOfChange: (prev.rateOfChange ?? 0) * (1 - phaseProgress),
          noiseMultiplier: prev.noiseMultiplier
            ? 1 + (prev.noiseMultiplier - 1) * (1 - phaseProgress)
            : undefined,
        }
      }
    }

    this.lastEffects = currentEffects
    return currentEffects
  }

  /**
   * Stop the active scenario.
   * Effects will gradually restore sensors to normal over RESTORE_DURATION_MS.
   */
  stop(): void {
    if (!this.active) return

    this.active.restoring = true
    this.active.restoreElapsed = 0
  }

  /** Whether a scenario is currently active (including restoring phase). */
  isActive(): boolean {
    return this.active !== null
  }

  /** Get the active scenario definition, or null. */
  getActiveScenario(): FailureScenario | null {
    return this.active?.scenario ?? null
  }

  /** Get the current phase definition, or null. */
  getCurrentPhase(): ScenarioPhase | null {
    if (!this.active) return null
    return this.active.scenario.phases[this.active.phaseIndex] ?? null
  }
}

/**
 * Linearly interpolate between two optional numbers.
 * If one side is undefined, the other is used directly.
 */
function lerpOpt(a: number | undefined, b: number | undefined, t: number): number | undefined {
  if (a === undefined && b === undefined) return undefined
  const va = a ?? b!
  const vb = b ?? a!
  return va + (vb - va) * t
}
