export type AgentActionType =
  | 'detect_anomaly'
  | 'predict_failure'
  | 'take_action'
  | 'suggest_action'
  | 'correlate'
  | 'resolve'
  | 'monitor'

export type Severity = 'info' | 'warning' | 'critical'

export interface AgentLogEntry {
  id: string
  timestamp: number
  actionType: AgentActionType
  severity: Severity
  title: string
  explanation: string
  confidence: number
  sensorIds: string[]
  equipmentId?: string
  action?: string
  costSaved?: number
}

export interface AgentThinkingStep {
  step: string
  detail: string
  completed: boolean
}

export interface AgentAnalysis {
  isThinking: boolean
  currentSteps: AgentThinkingStep[]
  currentPhase: string
}
