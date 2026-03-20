import { useEffect, useRef, useCallback } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { SceneCanvas } from './components/scene/SceneCanvas'
import { SensorEngine } from './engine/simulation/SensorEngine'
import { AgentOrchestrator } from './engine/ai/AgentOrchestrator'
import { useSimulationStore } from './engine/store/simulationStore'
import { AUTO_DEMO_SEQUENCE } from './config/scenarioPresets'

export default function App() {
  const sensorEngine = useRef<SensorEngine | null>(null)
  const agentOrchestrator = useRef<AgentOrchestrator | null>(null)
  const lastFrameTime = useRef(performance.now())
  const animFrameId = useRef(0)

  const isRunning = useSimulationStore(s => s.isRunning)
  const autoDemoActive = useSimulationStore(s => s.autoDemoActive)
  const autoDemoStep = useSimulationStore(s => s.autoDemoStep)
  const simulationTime = useSimulationStore(s => s.simulationTime)

  // Initialize engines
  useEffect(() => {
    sensorEngine.current = new SensorEngine()
    agentOrchestrator.current = new AgentOrchestrator()
  }, [])

  // Main simulation loop
  const loop = useCallback(() => {
    const now = performance.now()
    const wallDelta = Math.min(now - lastFrameTime.current, 100) // Cap at 100ms to avoid spiral
    lastFrameTime.current = now

    if (isRunning) {
      sensorEngine.current?.update(wallDelta)
      const simStore = useSimulationStore.getState()
      agentOrchestrator.current?.update(simStore.simulationTime, wallDelta * simStore.speedMultiplier)
    }

    animFrameId.current = requestAnimationFrame(loop)
  }, [isRunning])

  useEffect(() => {
    lastFrameTime.current = performance.now()
    animFrameId.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameId.current)
  }, [loop])

  // Auto-demo controller
  const autoDemoStartTime = useRef(0)
  useEffect(() => {
    if (!autoDemoActive) return

    const step = AUTO_DEMO_SEQUENCE[autoDemoStep]
    if (!step) {
      // Demo finished
      useSimulationStore.getState().stopAutoDemo()
      return
    }

    // Apply this step's settings
    const store = useSimulationStore.getState()
    store.setSpeed(step.speedMultiplier as 1 | 10 | 60 | 300)
    if (!store.isRunning) store.toggleRunning()

    if (step.scenarioId) {
      store.startScenario(step.scenarioId)
    } else {
      store.stopScenario()
    }

    autoDemoStartTime.current = performance.now()

    const timer = setTimeout(() => {
      useSimulationStore.getState().advanceAutoDemo()
    }, step.duration * 1000)

    return () => clearTimeout(timer)
  }, [autoDemoActive, autoDemoStep])

  return (
    <AppLayout>
      <SceneCanvas />
    </AppLayout>
  )
}
