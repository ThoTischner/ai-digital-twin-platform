import React from 'react'
import { Zap, RotateCcw, PlayCircle } from 'lucide-react'
import clsx from 'clsx'
import { useSimulationStore } from '../../engine/store/simulationStore'
import { SCENARIOS } from '../../config/scenarioPresets'

const categoryColors: Record<string, string> = {
  mechanical: 'bg-orange-500/20 text-orange-400',
  process: 'bg-blue-500/20 text-blue-400',
  chemical: 'bg-purple-500/20 text-purple-400',
  hydraulic: 'bg-cyan-500/20 text-cyan-400',
  systemic: 'bg-red-500/20 text-red-400',
}

export const FaultInjector: React.FC = () => {
  const activeScenarioId = useSimulationStore((s) => s.activeScenarioId)
  const autoDemoActive = useSimulationStore((s) => s.autoDemoActive)
  const startScenario = useSimulationStore((s) => s.startScenario)
  const stopScenario = useSimulationStore((s) => s.stopScenario)
  const resetSimulation = useSimulationStore((s) => s.resetSimulation)
  const startAutoDemo = useSimulationStore((s) => s.startAutoDemo)
  const stopAutoDemo = useSimulationStore((s) => s.stopAutoDemo)

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-3 border border-[#2a2a3e]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-yellow-400" />
        <span className="text-[#e2e8f0] text-xs font-semibold">Fault Injection</span>
      </div>

      {/* Scenario buttons */}
      <div className="flex flex-col gap-1.5">
        {SCENARIOS.map((scenario) => {
          const isActive = activeScenarioId === scenario.id
          const colorClass =
            categoryColors[scenario.category] ?? 'bg-[#2a2a3e] text-[#94a3b8]'

          return (
            <button
              key={scenario.id}
              onClick={() =>
                isActive ? stopScenario() : startScenario(scenario.id)
              }
              className={clsx(
                'flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-all',
                'border text-xs',
                isActive
                  ? 'bg-[#2a2a3e] border-yellow-500/50 animate-pulse'
                  : 'bg-[#12121a] border-[#2a2a3e] hover:bg-[#1e1e35]',
              )}
            >
              <span className="text-[#e2e8f0] flex-1 truncate">
                {scenario.name}
              </span>
              <span className={clsx('px-1.5 py-0.5 rounded text-[10px]', colorClass)}>
                {scenario.category}
              </span>
            </button>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => (autoDemoActive ? stopAutoDemo() : startAutoDemo())}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1 justify-center',
            autoDemoActive
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30',
          )}
        >
          <PlayCircle size={13} />
          {autoDemoActive ? 'Demo Running...' : 'Auto Demo'}
        </button>

        <button
          onClick={() => {
            stopScenario()
            stopAutoDemo()
            resetSimulation()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-[#94a3b8] hover:text-[#e2e8f0] bg-[#12121a] border border-[#2a2a3e] hover:bg-[#2a2a3e] transition-colors"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </div>
  )
}
