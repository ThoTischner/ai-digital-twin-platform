import React from 'react'
import { Play, Pause, FastForward } from 'lucide-react'
import clsx from 'clsx'
import { useSimulationStore } from '../../engine/store/simulationStore'
import { formatSimTime } from '../../utils/format'

const SPEEDS = [1, 10, 60, 300] as const

export const TimeControls: React.FC = () => {
  const isRunning = useSimulationStore((s) => s.isRunning)
  const speedMultiplier = useSimulationStore((s) => s.speedMultiplier)
  const simulationTime = useSimulationStore((s) => s.simulationTime)
  const toggleRunning = useSimulationStore((s) => s.toggleRunning)
  const setSpeed = useSimulationStore((s) => s.setSpeed)

  return (
    <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-lg p-2.5 border border-[#2a2a3e]">
      {/* Play / Pause */}
      <button
        onClick={toggleRunning}
        className={clsx(
          'p-2 rounded-md transition-colors',
          isRunning
            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            : 'bg-[#2a2a3e] text-[#e2e8f0] hover:bg-[#3a3a4e]',
        )}
        title={isRunning ? 'Pause' : 'Play'}
      >
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Speed selector */}
      <div className="flex items-center gap-1">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => setSpeed(speed)}
            className={clsx(
              'px-2 py-1 rounded text-xs font-medium transition-colors',
              speedMultiplier === speed
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#2a2a3e]',
            )}
          >
            {speed > 1 && <FastForward size={10} className="inline mr-0.5" />}
            {speed}x
          </button>
        ))}
      </div>

      {/* Sim time */}
      <div className="ml-auto font-mono text-xs text-[#e2e8f0]">
        {formatSimTime(simulationTime)}
      </div>
    </div>
  )
}
