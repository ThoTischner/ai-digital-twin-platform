import type { SensorState } from '../../types/sensor'
import type { AgentLogEntry, AgentThinkingStep } from '../../types/agent'
import { AnomalyDetector } from './AnomalyDetector'
import type { AnomalyResult } from './AnomalyDetector'
import { CorrelationAnalyzer } from './CorrelationAnalyzer'
import { PredictiveEngine } from './PredictiveEngine'
import { DecisionEngine } from './DecisionEngine'
import { NarrativeGenerator } from './NarrativeGenerator'
import { useAgentStore } from '../store/agentStore'
import { useSensorStore } from '../store/sensorStore'
import { useControlStore } from '../store/controlStore'
import { generateId } from '../../utils/math'

const ANALYSIS_INTERVAL_MS = 1000 // 1 second sim time
const ANOMALY_LOG_THRESHOLD = 0.5

const THINKING_STEPS = [
  'Collecting sensor data...',
  'Analyzing 14 sensor streams...',
  'Running anomaly detection...',
  'Checking correlations...',
  'Generating predictions...',
  'Evaluating actions...',
]

export class AgentOrchestrator {
  private anomalyDetector = new AnomalyDetector()
  private correlationAnalyzer = new CorrelationAnalyzer()
  private predictiveEngine = new PredictiveEngine()
  private decisionEngine = new DecisionEngine()
  private narrativeGenerator = new NarrativeGenerator()
  private lastAnalysisTime = 0

  update(simTime: number, simDeltaMs: number): void {
    if (simTime - this.lastAnalysisTime < ANALYSIS_INTERVAL_MS) return
    this.lastAnalysisTime = simTime

    const agentStore = useAgentStore.getState()
    const sensorStore = useSensorStore.getState()

    // Set thinking state with steps
    agentStore.setThinking(true)
    agentStore.setAnalysis({
      isThinking: true,
      currentSteps: [],
      currentPhase: THINKING_STEPS[0],
    })

    // Add thinking steps for UI animation
    for (const step of THINKING_STEPS) {
      agentStore.addThinkingStep({
        step,
        detail: '',
        completed: true,
      })
    }

    // Step 1: Collect sensor data
    const sensors = sensorStore.sensors
    const sensorEntries = Object.entries(sensors)

    // Step 2: Run anomaly detection on each sensor
    const anomalies: { sensorId: string; result: AnomalyResult; state: SensorState }[] = []

    for (const [sensorId, state] of sensorEntries) {
      const result = this.anomalyDetector.analyze(
        sensorId,
        state.readings,
        state.config,
      )

      if (result.score >= ANOMALY_LOG_THRESHOLD) {
        anomalies.push({ sensorId, result, state })
      }
    }

    // Step 3: Build correlation data and run correlation analysis
    const sensorReadings: Record<string, number[]> = {}
    for (const [sensorId, state] of sensorEntries) {
      sensorReadings[sensorId] = state.readings.map((r) => r.value)
    }

    const correlationBreaks = this.correlationAnalyzer.analyze(sensorReadings)

    // Step 4: Run predictions on anomalous sensors
    const predictions = anomalies
      .map(({ sensorId, state }) =>
        this.predictiveEngine.predict(sensorId, state.readings, state.config),
      )
      .filter((p): p is NonNullable<typeof p> => p !== null)

    // Step 5: Run decision engine
    const anomalyEntries = anomalies.map(({ sensorId, result }) => ({
      sensorId,
      result,
    }))
    const decisions = this.decisionEngine.decide(
      anomalyEntries,
      correlationBreaks,
      predictions,
      sensors,
      simTime,
    )

    // Step 6: Generate narratives and log entries
    // Log anomalies
    for (const { sensorId, result, state } of anomalies) {
      const text = this.narrativeGenerator.generateDetection(
        sensorId,
        result.score,
        result.method,
        state.currentValue,
        state.config.unit,
      )

      const severity = result.score > 0.8 ? 'critical' : result.score > 0.5 ? 'warning' : 'info'

      const entry: AgentLogEntry = {
        id: generateId(),
        timestamp: simTime,
        actionType: 'detect_anomaly',
        severity,
        title: `Anomaly on ${state.config.name}`,
        explanation: text,
        confidence: result.score,
        sensorIds: [sensorId],
        equipmentId: state.config.equipmentId,
      }

      agentStore.addLogEntry(entry)
    }

    // Log correlation breaks
    for (const brk of correlationBreaks) {
      const text = this.narrativeGenerator.generateCorrelation(
        brk.sensorA,
        brk.sensorB,
        brk.explanation,
      )

      const entry: AgentLogEntry = {
        id: generateId(),
        timestamp: simTime,
        actionType: 'correlate',
        severity: brk.severity,
        title: `Correlation break: ${brk.sensorA} \u2194 ${brk.sensorB}`,
        explanation: text,
        confidence: Math.abs(brk.actual),
        sensorIds: [brk.sensorA, brk.sensorB],
      }

      agentStore.addLogEntry(entry)
    }

    // Log predictions
    for (const prediction of predictions) {
      const hoursRemaining = prediction.predictedTimeToThreshold / (1000 * 60 * 60)
      const timeStr = hoursRemaining >= 1
        ? `${hoursRemaining.toFixed(1)} hours`
        : `${(hoursRemaining * 60).toFixed(0)} minutes`

      const text = this.narrativeGenerator.generatePrediction(
        prediction.sensorId,
        timeStr,
        prediction.confidence,
      )

      const sensorState = sensors[prediction.sensorId]
      const entry: AgentLogEntry = {
        id: generateId(),
        timestamp: simTime,
        actionType: 'predict_failure',
        severity: hoursRemaining < 1 ? 'critical' : 'warning',
        title: `Predicted threshold breach on ${sensorState?.config.name ?? prediction.sensorId}`,
        explanation: text,
        confidence: prediction.confidence,
        sensorIds: [prediction.sensorId],
        equipmentId: sensorState?.config.equipmentId,
      }

      agentStore.addLogEntry(entry)
    }

    // Log and execute decisions
    const controlMode = useControlStore.getState().mode

    for (const decision of decisions) {
      const text = this.narrativeGenerator.generateAction(
        decision.action,
        decision.reason,
        decision.targetEquipment,
      )

      if (controlMode === 'auto') {
        // Full autonomous mode: execute immediately
        const entry: AgentLogEntry = {
          id: generateId(),
          timestamp: simTime,
          actionType: 'take_action',
          severity: 'warning',
          title: `Action: ${decision.action.replace(/_/g, ' ')}`,
          explanation: text,
          confidence: decision.confidence,
          sensorIds: decision.targetSensor ? [decision.targetSensor] : [],
          equipmentId: decision.targetEquipment,
          action: decision.action,
          costSaved: decision.estimatedCostSaved,
        }

        agentStore.addLogEntry(entry)

        // Execute the decision by overriding sensor values
        if (decision.targetSensor) {
          sensorStore.overrideSensorValue(decision.targetSensor, decision.newValue)
        }
      } else if (controlMode === 'hybrid') {
        // Hybrid mode: log as suggestion, don't auto-execute
        const entry: AgentLogEntry = {
          id: generateId(),
          timestamp: simTime,
          actionType: 'suggest_action',
          severity: 'info',
          title: `Suggested: ${decision.action.replace(/_/g, ' ')}`,
          explanation: `[Hybrid mode — awaiting operator approval] ${text}`,
          confidence: decision.confidence,
          sensorIds: decision.targetSensor ? [decision.targetSensor] : [],
          equipmentId: decision.targetEquipment,
          action: decision.action,
          costSaved: decision.estimatedCostSaved,
        }

        agentStore.addLogEntry(entry)
      } else {
        // Manual mode: log as recommendation only
        const entry: AgentLogEntry = {
          id: generateId(),
          timestamp: simTime,
          actionType: 'suggest_action',
          severity: 'info',
          title: `Recommendation: ${decision.action.replace(/_/g, ' ')}`,
          explanation: `[Manual mode — AI monitoring only] ${text}`,
          confidence: decision.confidence,
          sensorIds: decision.targetSensor ? [decision.targetSensor] : [],
          equipmentId: decision.targetEquipment,
          action: decision.action,
          costSaved: decision.estimatedCostSaved,
        }

        agentStore.addLogEntry(entry)
      }
    }

    // Done thinking
    agentStore.setThinking(false)
    agentStore.setAnalysis(null)
  }

  reset(): void {
    this.lastAnalysisTime = 0
    this.decisionEngine.reset()
  }
}
