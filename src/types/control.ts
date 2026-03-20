export type ControlMode = 'auto' | 'manual' | 'hybrid'

// Manual override for a single parameter
export interface ManualOverride {
  sensorId: string
  targetValue: number
  active: boolean
  timestamp: number
}

// Equipment-level control state
export interface PumpControl {
  equipmentId: string
  running: boolean        // on/off
  targetRpm: number       // 0-3600
  rpmSensorId: string
}

export interface ValveControl {
  equipmentId: string
  openPercent: number     // 0-100
  flowSensorId: string
}

export interface DosingControl {
  equipmentId: string
  targetPh: number        // 5.0-9.0
  phSensorId: string
  dosingRate: number      // 0-100%
}

export interface FilterControl {
  equipmentId: string
  active: boolean
  backwashMode: boolean
  flowSensorId: string
  pressureSensorId: string
}

// All equipment controls
export interface PlantControls {
  pumps: Record<string, PumpControl>
  valves: Record<string, ValveControl>
  dosing: Record<string, DosingControl>
  filters: Record<string, FilterControl>
}

export interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string  // CSS selector or equipment ID to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: string  // what the user should do
}
