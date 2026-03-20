import { NoiseGenerator } from './NoiseGenerator'
import { TimeManager } from './TimeManager'
import { FailureScenarioManager } from './FailureScenarios'
import { computeSensorValue } from './SensorModels'
import { SENSORS } from '../../config/sensorConfig'
import { useSensorStore } from '../store/sensorStore'
import { useSimulationStore } from '../store/simulationStore'
import { useControlStore } from '../store/controlStore'
import { HealthStatus, SensorReading } from '../../types/sensor'

/**
 * SensorEngine — the main simulation loop coordinator.
 * On each update, it:
 *   1. Computes simulation delta via TimeManager
 *   2. Gets active failure scenario effects
 *   3. Computes sensor values using physics models
 *   4. Determines health status and pushes readings to the store
 */
export class SensorEngine {
  private noise: NoiseGenerator
  private failureManager: FailureScenarioManager
  private timeManager: TimeManager

  constructor() {
    this.noise = new NoiseGenerator()
    this.failureManager = new FailureScenarioManager()
    this.timeManager = TimeManager.getInstance()
  }

  /**
   * Run one simulation tick.
   * Called from the outer animation loop with wall-clock delta.
   */
  update(wallDeltaMs: number): void {
    const simDeltaMs = this.timeManager.tick(wallDeltaMs)
    if (simDeltaMs === 0) return

    const simState = useSimulationStore.getState()
    const simTime = simState.simulationTime

    // Get scenario effects (empty record if no active scenario)
    const scenarioEffects = this.failureManager.update(simDeltaMs)

    const sensorStore = useSensorStore.getState()
    const controlState = useControlStore.getState()

    for (const config of SENSORS) {
      // Compute the raw sensor value using physics models + scenario overrides
      let value = computeSensorValue(
        config.id,
        simTime,
        this.noise,
        Object.keys(scenarioEffects).length > 0 ? scenarioEffects : undefined,
      )

      // Apply manual cockpit overrides (these take priority over scenario effects in manual/hybrid mode)
      if (controlState.mode !== 'auto') {
        const manualValue = this.getManualOverrideValue(config.id, controlState)
        if (manualValue !== null) {
          // Blend manual override: lerp current value toward manual target
          value = value + (manualValue - value) * 0.1
        }
      }

      // Emergency stop: force pumps to 0 RPM, valves to 0 flow
      if (controlState.emergencyStop) {
        if (config.type === 'rpm') value = 0
        if (config.type === 'flow_rate') value = 0
      }

      // Determine health status based on config thresholds
      const health = determineHealth(value, config.warningMin, config.warningMax, config.normalMin, config.normalMax)

      // Compute anomaly score: 0 = perfectly normal, 1 = at/beyond warning boundary
      const anomalyScore = computeAnomalyScore(value, config.normalMin, config.normalMax, config.warningMin, config.warningMax)

      const reading: SensorReading = {
        timestamp: simTime,
        value,
        anomalyScore,
      }

      // Push reading to store
      sensorStore.updateReading(config.id, reading)

      // Update health status
      sensorStore.setSensorHealth(config.id, health)
    }
  }

  /** Start a failure scenario by ID. */
  startScenario(scenarioId: string): void {
    this.failureManager.start(scenarioId)
  }

  /** Stop the currently running failure scenario. */
  stopScenario(): void {
    this.failureManager.stop()
  }

  /** Whether a failure scenario is currently active. */
  isScenarioActive(): boolean {
    return this.failureManager.isActive()
  }

  /** Get the active failure scenario, or null. */
  getActiveScenario() {
    return this.failureManager.getActiveScenario()
  }

  /** Get the current phase of the active scenario, or null. */
  getCurrentPhase() {
    return this.failureManager.getCurrentPhase()
  }

  /** Access the failure manager directly if needed. */
  getFailureManager(): FailureScenarioManager {
    return this.failureManager
  }

  private getManualOverrideValue(sensorId: string, controlState: any): number | null {
    // Check direct manual overrides first
    const override = controlState.manualOverrides[sensorId]
    if (override?.active) return override.targetValue

    // Map equipment controls to sensor overrides
    // Pumps: RPM sensor
    for (const pump of Object.values(controlState.pumps) as any[]) {
      if (pump.rpmSensorId === sensorId) {
        return pump.running ? pump.targetRpm : 0
      }
    }

    // Valves: Flow sensor — map openPercent to flow range
    for (const valve of Object.values(controlState.valves) as any[]) {
      if (valve.flowSensorId === sensorId) {
        const sensorConfig = SENSORS.find(s => s.id === sensorId)
        if (sensorConfig) {
          return sensorConfig.baseValue * (valve.openPercent / 75) // 75% = normal open = base value
        }
      }
    }

    // Dosing: pH sensor
    for (const dosing of Object.values(controlState.dosing) as any[]) {
      if (dosing.phSensorId === sensorId) {
        return dosing.targetPh
      }
    }

    // Filters: Flow sensor
    for (const filter of Object.values(controlState.filters) as any[]) {
      if (filter.flowSensorId === sensorId) {
        const sensorConfig = SENSORS.find(s => s.id === sensorId)
        if (sensorConfig) {
          if (!filter.active) return sensorConfig.baseValue * 0.05 // nearly zero flow when inactive
          if (filter.backwashMode) return sensorConfig.baseValue * 0.3 // reduced flow during backwash
          return sensorConfig.baseValue
        }
      }
    }

    return null
  }
}

/**
 * Determine sensor health based on value vs thresholds.
 * - critical: outside warning range
 * - warning: outside normal range but within warning range
 * - normal: within normal range
 */
function determineHealth(
  value: number,
  warningMin: number,
  warningMax: number,
  normalMin: number,
  normalMax: number,
): HealthStatus {
  if (value < warningMin || value > warningMax) {
    return 'critical'
  }
  if (value < normalMin || value > normalMax) {
    return 'warning'
  }
  return 'normal'
}

/**
 * Compute an anomaly score in [0, 1].
 * 0 = value is at center of normal range.
 * 1 = value is at or beyond warning boundary.
 */
function computeAnomalyScore(
  value: number,
  normalMin: number,
  normalMax: number,
  warningMin: number,
  warningMax: number,
): number {
  const normalCenter = (normalMin + normalMax) / 2
  const normalHalfRange = (normalMax - normalMin) / 2

  if (normalHalfRange === 0) return 0

  const deviation = Math.abs(value - normalCenter)
  const normalizedDeviation = deviation / normalHalfRange

  // Beyond normal range, scale up toward 1 as we approach warning bounds
  if (normalizedDeviation > 1) {
    const warningHalfRange = Math.max(
      normalCenter - warningMin,
      warningMax - normalCenter,
    )
    const warningDeviation = deviation / warningHalfRange
    return Math.min(warningDeviation, 1)
  }

  // Within normal range, score is proportional to distance from center
  return normalizedDeviation * 0.5
}
