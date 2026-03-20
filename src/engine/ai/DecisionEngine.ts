import type { SensorState } from '../../types/sensor'
import type { AnomalyResult } from './AnomalyDetector'
import type { CorrelationBreak } from './CorrelationAnalyzer'
import type { Prediction } from './PredictiveEngine'

const COOLDOWN_MS = 30_000 // 30 seconds sim-time

export interface Decision {
  action: string
  targetEquipment: string
  targetSensor?: string
  parameter: string
  newValue: number
  reason: string
  confidence: number
  estimatedCostSaved: number
}

interface AnomalyEntry {
  sensorId: string
  result: AnomalyResult
}

export class DecisionEngine {
  private lastActionTimes: Map<string, number> = new Map()

  decide(
    anomalies: AnomalyEntry[],
    correlationBreaks: CorrelationBreak[],
    predictions: Prediction[],
    sensorStates: Record<string, SensorState>,
    simTime: number = 0,
  ): Decision[] {
    const decisions: Decision[] = []

    // Rule 1: High vibration + short RUL on pump -> reduce RPM
    this.evaluatePumpVibration(anomalies, predictions, sensorStates, simTime, decisions)

    // Rule 2: Filter pressure high + flow dropping -> switch to backup
    this.evaluateFilterClog(anomalies, sensorStates, simTime, decisions)

    // Rule 3: Tank level > 90% -> reduce intake
    this.evaluateTankOverflow(sensorStates, simTime, decisions)

    // Rule 4: pH out of range -> adjust dosing
    this.evaluatePhBalance(anomalies, sensorStates, simTime, decisions)

    // Rule 5: Tank level < 20% -> increase intake
    this.evaluateTankLow(sensorStates, simTime, decisions)

    return decisions
  }

  reset(): void {
    this.lastActionTimes.clear()
  }

  private canAct(actionKey: string, simTime: number): boolean {
    const lastTime = this.lastActionTimes.get(actionKey)
    if (lastTime === undefined) return true
    return simTime - lastTime >= COOLDOWN_MS
  }

  private recordAction(actionKey: string, simTime: number): void {
    this.lastActionTimes.set(actionKey, simTime)
  }

  private evaluatePumpVibration(
    anomalies: AnomalyEntry[],
    predictions: Prediction[],
    sensorStates: Record<string, SensorState>,
    simTime: number,
    decisions: Decision[],
  ): void {
    const actionKey = 'reduce_pump_speed'
    if (!this.canAct(actionKey, simTime)) return

    // Check P-101 vibration anomaly
    const vibAnomaly = anomalies.find(
      (a) => a.sensorId === 'S-P101-VIB' && a.result.score > 0.7,
    )
    if (!vibAnomaly) return

    // Check for short remaining useful life
    const vibPrediction = predictions.find((p) => p.sensorId === 'S-P101-VIB')
    const hasShortRUL =
      vibPrediction && vibPrediction.predictedTimeToThreshold < 4 * 60 * 60 * 1000 // 4 hours

    const rpmState = sensorStates['S-P101-RPM']
    if (!rpmState) return

    const baseRPM = rpmState.config.baseValue
    const targetRPM = Math.round(baseRPM * 0.7)

    decisions.push({
      action: 'reduce_pump_speed',
      targetEquipment: 'P-101',
      targetSensor: 'S-P101-RPM',
      parameter: 'rpm',
      newValue: targetRPM,
      reason: `High vibration detected (score: ${vibAnomaly.result.score.toFixed(2)})${hasShortRUL ? ` with predicted threshold breach in ${((vibPrediction!.predictedTimeToThreshold) / (1000 * 60 * 60)).toFixed(1)}h` : ''}. Reducing pump speed to limit further bearing damage.`,
      confidence: vibAnomaly.result.score,
      estimatedCostSaved: 45000,
    })

    this.recordAction(actionKey, simTime)
  }

  private evaluateFilterClog(
    anomalies: AnomalyEntry[],
    sensorStates: Record<string, SensorState>,
    simTime: number,
    decisions: Decision[],
  ): void {
    const actionKey = 'switch_to_backup_filter'
    if (!this.canAct(actionKey, simTime)) return

    const pressState = sensorStates['S-F301-PRES']
    const flowState = sensorStates['S-F301-FLOW']
    if (!pressState || !flowState) return

    const pressureHigh = pressState.currentValue > pressState.config.warningMax
    const flowDropping = flowState.trend === 'falling'

    if (!pressureHigh || !flowDropping) return

    decisions.push({
      action: 'switch_to_backup_filter',
      targetEquipment: 'F-301',
      targetSensor: 'S-F301-FLOW',
      parameter: 'flow_rate',
      newValue: flowState.config.baseValue * 0.3,
      reason: `Filter F-301 pressure (${pressState.currentValue.toFixed(1)} bar) exceeds warning threshold while flow is dropping. Switching to backup filter F-302 to maintain water quality.`,
      confidence: 0.85,
      estimatedCostSaved: 12000,
    })

    this.recordAction(actionKey, simTime)
  }

  private evaluateTankOverflow(
    sensorStates: Record<string, SensorState>,
    simTime: number,
    decisions: Decision[],
  ): void {
    const actionKey = 'reduce_intake'
    if (!this.canAct(actionKey, simTime)) return

    // Check all tank level sensors
    const tankSensors = ['S-T201-LVL', 'S-T303-LVL']
    for (const sensorId of tankSensors) {
      const state = sensorStates[sensorId]
      if (!state) continue

      if (state.currentValue > 90) {
        const flowState = sensorStates['S-V101-FLOW']
        if (!flowState) continue

        decisions.push({
          action: 'reduce_intake',
          targetEquipment: 'V-101',
          targetSensor: 'S-V101-FLOW',
          parameter: 'flow_rate',
          newValue: flowState.config.baseValue * 0.5,
          reason: `${state.config.name} at ${state.currentValue.toFixed(1)}% — approaching overflow. Reducing intake valve V-101 flow to 50% to prevent overflow.`,
          confidence: 0.9,
          estimatedCostSaved: 25000,
        })

        this.recordAction(actionKey, simTime)
        break
      }
    }
  }

  private evaluatePhBalance(
    anomalies: AnomalyEntry[],
    sensorStates: Record<string, SensorState>,
    simTime: number,
    decisions: Decision[],
  ): void {
    const actionKey = 'adjust_dosing'
    if (!this.canAct(actionKey, simTime)) return

    const phState = sensorStates['S-T202-PH']
    if (!phState) return

    const { currentValue, config } = phState
    const outOfRange = currentValue < config.normalMin || currentValue > config.normalMax

    if (!outOfRange) return

    // Nudge pH back toward 7.0
    const direction = currentValue > 7.0 ? 'decrease' : 'increase'
    const adjustment = currentValue > 7.0
      ? Math.max(currentValue - 0.5, 7.0)
      : Math.min(currentValue + 0.5, 7.0)

    decisions.push({
      action: 'adjust_dosing',
      targetEquipment: 'D-501',
      targetSensor: 'S-T202-PH',
      parameter: 'ph_target',
      newValue: adjustment,
      reason: `pH reading of ${currentValue.toFixed(2)} is outside normal range (${config.normalMin}-${config.normalMax}). Adjusting chemical dosing to ${direction} pH toward neutral.`,
      confidence: 0.8,
      estimatedCostSaved: 8000,
    })

    this.recordAction(actionKey, simTime)
  }

  private evaluateTankLow(
    sensorStates: Record<string, SensorState>,
    simTime: number,
    decisions: Decision[],
  ): void {
    const actionKey = 'increase_intake'
    if (!this.canAct(actionKey, simTime)) return

    const tankSensors = ['S-T201-LVL', 'S-T303-LVL']
    for (const sensorId of tankSensors) {
      const state = sensorStates[sensorId]
      if (!state) continue

      if (state.currentValue < 20) {
        const flowState = sensorStates['S-V101-FLOW']
        if (!flowState) continue

        decisions.push({
          action: 'increase_intake',
          targetEquipment: 'V-101',
          targetSensor: 'S-V101-FLOW',
          parameter: 'flow_rate',
          newValue: flowState.config.baseValue * 1.3,
          reason: `${state.config.name} at ${state.currentValue.toFixed(1)}% — critically low. Increasing intake valve V-101 flow to replenish supply.`,
          confidence: 0.85,
          estimatedCostSaved: 15000,
        })

        this.recordAction(actionKey, simTime)
        break
      }
    }
  }
}
