import { create } from 'zustand'

type SpeedMultiplier = 1 | 10 | 60 | 300

interface SimulationState {
  isRunning: boolean
  speedMultiplier: SpeedMultiplier
  simulationTime: number
  activeScenarioId: string | null
  scenarioPhaseIndex: number
  scenarioElapsed: number
  autoDemoActive: boolean
  autoDemoStep: number
}

interface SimulationActions {
  toggleRunning: () => void
  setSpeed: (speed: SpeedMultiplier) => void
  advanceTime: (deltaMs: number) => void
  startScenario: (id: string) => void
  stopScenario: () => void
  resetSimulation: () => void
  startAutoDemo: () => void
  stopAutoDemo: () => void
  advanceAutoDemo: () => void
}

const initialState: SimulationState = {
  isRunning: false,
  speedMultiplier: 1,
  simulationTime: 0,
  activeScenarioId: null,
  scenarioPhaseIndex: 0,
  scenarioElapsed: 0,
  autoDemoActive: false,
  autoDemoStep: 0,
}

export const useSimulationStore = create<SimulationState & SimulationActions>()(
  (set) => ({
    ...initialState,

    toggleRunning: () =>
      set((state) => ({ isRunning: !state.isRunning })),

    setSpeed: (speed) =>
      set({ speedMultiplier: speed }),

    advanceTime: (deltaMs) =>
      set((state) => ({
        simulationTime: state.simulationTime + deltaMs * state.speedMultiplier,
        scenarioElapsed: state.activeScenarioId
          ? state.scenarioElapsed + deltaMs * state.speedMultiplier
          : state.scenarioElapsed,
      })),

    startScenario: (id) =>
      set({
        activeScenarioId: id,
        scenarioPhaseIndex: 0,
        scenarioElapsed: 0,
        isRunning: true,
      }),

    stopScenario: () =>
      set({
        activeScenarioId: null,
        scenarioPhaseIndex: 0,
        scenarioElapsed: 0,
      }),

    resetSimulation: () => set(initialState),

    startAutoDemo: () =>
      set({
        autoDemoActive: true,
        autoDemoStep: 0,
        isRunning: true,
      }),

    stopAutoDemo: () =>
      set({
        autoDemoActive: false,
        autoDemoStep: 0,
      }),

    advanceAutoDemo: () =>
      set((state) => ({
        autoDemoStep: state.autoDemoStep + 1,
      })),
  }),
)
