import { create } from 'zustand'
import {
  ControlMode,
  ManualOverride,
  PumpControl,
  ValveControl,
  DosingControl,
  FilterControl,
} from '../../types/control'

interface ControlStoreState {
  mode: ControlMode
  manualOverrides: Record<string, ManualOverride>
  pumps: Record<string, PumpControl>
  valves: Record<string, ValveControl>
  dosing: Record<string, DosingControl>
  filters: Record<string, FilterControl>
  emergencyStop: boolean
  tutorialActive: boolean
  tutorialStep: number
  tutorialCompleted: boolean
}

interface ControlStoreActions {
  setMode: (mode: ControlMode) => void
  setPumpRunning: (equipmentId: string, running: boolean) => void
  setPumpRpm: (equipmentId: string, rpm: number) => void
  setValveOpen: (equipmentId: string, percent: number) => void
  setDosingRate: (equipmentId: string, rate: number) => void
  setDosingTargetPh: (equipmentId: string, ph: number) => void
  setFilterActive: (equipmentId: string, active: boolean) => void
  setFilterBackwash: (equipmentId: string, backwash: boolean) => void
  triggerEmergencyStop: () => void
  resetEmergencyStop: () => void
  setManualOverride: (sensorId: string, value: number) => void
  clearManualOverride: (sensorId: string) => void
  clearAllOverrides: () => void
  startTutorial: () => void
  nextTutorialStep: () => void
  prevTutorialStep: () => void
  completeTutorial: () => void
  skipTutorial: () => void
}

function loadTutorialCompleted(): boolean {
  try {
    return localStorage.getItem('tutorialCompleted') === 'true'
  } catch {
    return false
  }
}

function saveTutorialCompleted(completed: boolean): void {
  try {
    localStorage.setItem('tutorialCompleted', String(completed))
  } catch {
    // localStorage unavailable
  }
}

const initialPumps: Record<string, PumpControl> = {
  'P-101': { equipmentId: 'P-101', running: true, targetRpm: 1500, rpmSensorId: 'S-P101-RPM' },
  'P-102': { equipmentId: 'P-102', running: false, targetRpm: 0, rpmSensorId: 'S-P102-VIB' },
  'P-401': { equipmentId: 'P-401', running: true, targetRpm: 1500, rpmSensorId: '' },
}

const initialValves: Record<string, ValveControl> = {
  'V-101': { equipmentId: 'V-101', openPercent: 75, flowSensorId: 'S-V101-FLOW' },
  'V-401': { equipmentId: 'V-401', openPercent: 80, flowSensorId: '' },
}

const initialDosing: Record<string, DosingControl> = {
  'D-501': { equipmentId: 'D-501', targetPh: 7.0, phSensorId: 'S-T202-PH', dosingRate: 50 },
}

const initialFilters: Record<string, FilterControl> = {
  'F-301': { equipmentId: 'F-301', active: true, backwashMode: false, flowSensorId: 'S-F301-FLOW', pressureSensorId: 'S-F301-PRES' },
  'F-302': { equipmentId: 'F-302', active: false, backwashMode: false, flowSensorId: '', pressureSensorId: 'S-F302-PRES' },
}

export const useControlStore = create<ControlStoreState & ControlStoreActions>((set) => ({
  // State
  mode: 'auto',
  manualOverrides: {},
  pumps: { ...initialPumps },
  valves: { ...initialValves },
  dosing: { ...initialDosing },
  filters: { ...initialFilters },
  emergencyStop: false,
  tutorialActive: false,
  tutorialStep: 0,
  tutorialCompleted: loadTutorialCompleted(),

  // Actions
  setMode: (mode) => set({ mode }),

  setPumpRunning: (equipmentId, running) =>
    set((state) => {
      const pump = state.pumps[equipmentId]
      if (!pump) return state
      return {
        pumps: { ...state.pumps, [equipmentId]: { ...pump, running } },
      }
    }),

  setPumpRpm: (equipmentId, rpm) =>
    set((state) => {
      const pump = state.pumps[equipmentId]
      if (!pump) return state
      const clamped = Math.max(0, Math.min(3600, rpm))
      return {
        pumps: { ...state.pumps, [equipmentId]: { ...pump, targetRpm: clamped } },
      }
    }),

  setValveOpen: (equipmentId, percent) =>
    set((state) => {
      const valve = state.valves[equipmentId]
      if (!valve) return state
      const clamped = Math.max(0, Math.min(100, percent))
      return {
        valves: { ...state.valves, [equipmentId]: { ...valve, openPercent: clamped } },
      }
    }),

  setDosingRate: (equipmentId, rate) =>
    set((state) => {
      const d = state.dosing[equipmentId]
      if (!d) return state
      const clamped = Math.max(0, Math.min(100, rate))
      return {
        dosing: { ...state.dosing, [equipmentId]: { ...d, dosingRate: clamped } },
      }
    }),

  setDosingTargetPh: (equipmentId, ph) =>
    set((state) => {
      const d = state.dosing[equipmentId]
      if (!d) return state
      const clamped = Math.max(5, Math.min(9, ph))
      return {
        dosing: { ...state.dosing, [equipmentId]: { ...d, targetPh: clamped } },
      }
    }),

  setFilterActive: (equipmentId, active) =>
    set((state) => {
      const f = state.filters[equipmentId]
      if (!f) return state
      return {
        filters: { ...state.filters, [equipmentId]: { ...f, active } },
      }
    }),

  setFilterBackwash: (equipmentId, backwash) =>
    set((state) => {
      const f = state.filters[equipmentId]
      if (!f) return state
      return {
        filters: { ...state.filters, [equipmentId]: { ...f, backwashMode: backwash } },
      }
    }),

  triggerEmergencyStop: () =>
    set((state) => {
      const pumps: Record<string, PumpControl> = {}
      for (const [id, pump] of Object.entries(state.pumps)) {
        pumps[id] = { ...pump, running: false }
      }
      const valves: Record<string, ValveControl> = {}
      for (const [id, valve] of Object.entries(state.valves)) {
        valves[id] = { ...valve, openPercent: 0 }
      }
      return { emergencyStop: true, pumps, valves }
    }),

  resetEmergencyStop: () =>
    set({
      emergencyStop: false,
      pumps: { ...initialPumps },
      valves: { ...initialValves },
      dosing: { ...initialDosing },
      filters: { ...initialFilters },
    }),

  setManualOverride: (sensorId, value) =>
    set((state) => ({
      manualOverrides: {
        ...state.manualOverrides,
        [sensorId]: {
          sensorId,
          targetValue: value,
          active: true,
          timestamp: Date.now(),
        },
      },
    })),

  clearManualOverride: (sensorId) =>
    set((state) => {
      const { [sensorId]: _, ...rest } = state.manualOverrides
      return { manualOverrides: rest }
    }),

  clearAllOverrides: () => set({ manualOverrides: {} }),

  startTutorial: () => set({ tutorialActive: true, tutorialStep: 0 }),

  nextTutorialStep: () =>
    set((state) => ({ tutorialStep: state.tutorialStep + 1 })),

  prevTutorialStep: () =>
    set((state) => ({ tutorialStep: Math.max(0, state.tutorialStep - 1) })),

  completeTutorial: () => {
    saveTutorialCompleted(true)
    return set({ tutorialActive: false, tutorialCompleted: true })
  },

  skipTutorial: () => set({ tutorialActive: false }),
}))
