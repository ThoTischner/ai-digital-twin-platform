export interface ScenarioPhase {
  name: string
  duration: number
  description: string
  sensorEffects: Record<string, {
    targetValue?: number
    rateOfChange?: number
    noiseMultiplier?: number
  }>
}

export interface FailureScenario {
  id: string
  name: string
  description: string
  category: string
  phases: ScenarioPhase[]
  affectedEquipment: string[]
  affectedSensors: string[]
  expectedDetectionTime: number
  estimatedCostImpact: number
}
