import { create } from 'zustand'
import { AgentLogEntry, AgentAnalysis, AgentThinkingStep } from '../../types/agent'

const MAX_LOG_ENTRIES = 100

interface AgentStoreState {
  log: AgentLogEntry[]
  isThinking: boolean
  currentAnalysis: AgentAnalysis | null
  totalAnomaliesDetected: number
  totalActionsExecuted: number
  estimatedCostSaved: number
}

interface AgentStoreActions {
  addLogEntry: (entry: AgentLogEntry) => void
  setThinking: (thinking: boolean) => void
  setAnalysis: (analysis: AgentAnalysis | null) => void
  addThinkingStep: (step: AgentThinkingStep) => void
  incrementCostSaved: (amount: number) => void
  clearLog: () => void
}

export const useAgentStore = create<AgentStoreState & AgentStoreActions>()(
  (set) => ({
    log: [],
    isThinking: false,
    currentAnalysis: null,
    totalAnomaliesDetected: 0,
    totalActionsExecuted: 0,
    estimatedCostSaved: 0,

    addLogEntry: (entry) =>
      set((state) => {
        const log = [entry, ...state.log]
        if (log.length > MAX_LOG_ENTRIES) {
          log.length = MAX_LOG_ENTRIES
        }

        const isAnomaly =
          entry.actionType === 'detect_anomaly' ||
          entry.actionType === 'predict_failure'
        const isAction = entry.actionType === 'take_action'

        return {
          log,
          totalAnomaliesDetected:
            state.totalAnomaliesDetected + (isAnomaly ? 1 : 0),
          totalActionsExecuted:
            state.totalActionsExecuted + (isAction ? 1 : 0),
          estimatedCostSaved:
            state.estimatedCostSaved + (entry.costSaved ?? 0),
        }
      }),

    setThinking: (thinking) => set({ isThinking: thinking }),

    setAnalysis: (analysis) => set({ currentAnalysis: analysis }),

    addThinkingStep: (step) =>
      set((state) => {
        if (!state.currentAnalysis) return state
        return {
          currentAnalysis: {
            ...state.currentAnalysis,
            currentSteps: [...state.currentAnalysis.currentSteps, step],
          },
        }
      }),

    incrementCostSaved: (amount) =>
      set((state) => ({
        estimatedCostSaved: state.estimatedCostSaved + amount,
      })),

    clearLog: () =>
      set({
        log: [],
        totalAnomaliesDetected: 0,
        totalActionsExecuted: 0,
        estimatedCostSaved: 0,
      }),
  }),
)
