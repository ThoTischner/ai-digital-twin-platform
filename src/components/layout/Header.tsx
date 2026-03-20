import React from 'react'
import { Activity, Eye, EyeOff, LayoutDashboard, Gauge, GraduationCap } from 'lucide-react'
import clsx from 'clsx'
import { useSimulationStore } from '../../engine/store/simulationStore'
import { useSceneStore } from '../../engine/store/sceneStore'
import { useControlStore } from '../../engine/store/controlStore'
import { formatSimTime } from '../../utils/format'

export const Header: React.FC = () => {
  const simulationTime = useSimulationStore((s) => s.simulationTime)
  const speedMultiplier = useSimulationStore((s) => s.speedMultiplier)
  const isRunning = useSimulationStore((s) => s.isRunning)
  const showLabels = useSceneStore((s) => s.showLabels)
  const showParticles = useSceneStore((s) => s.showParticles)
  const toggleLabels = useSceneStore((s) => s.toggleLabels)
  const toggleParticles = useSceneStore((s) => s.toggleParticles)
  const activePanel = useSceneStore((s) => s.activePanel)
  const setActivePanel = useSceneStore((s) => s.setActivePanel)
  const startTutorial = useControlStore((s) => s.startTutorial)
  const tutorialCompleted = useControlStore((s) => s.tutorialCompleted)

  return (
    <header className="h-12 min-h-[48px] bg-[#12121a] border-b border-[#2a2a3e] flex items-center px-4 z-20">
      {/* Left: Logo + Tabs */}
      <div className="flex items-center gap-2">
        <Activity size={20} className="text-blue-400" />
        <span className="text-[#e2e8f0] font-semibold text-sm tracking-wide">
          AI Digital Twin
        </span>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => setActivePanel('dashboard')}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors',
              activePanel === 'dashboard'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-transparent text-[#94a3b8] hover:text-[#e2e8f0]',
            )}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
          <button
            onClick={() => setActivePanel('cockpit')}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors',
              activePanel === 'cockpit'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-transparent text-[#94a3b8] hover:text-[#e2e8f0]',
            )}
          >
            <Gauge size={14} />
            Cockpit
          </button>
        </div>
      </div>

      {/* Center: Sim time */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[#94a3b8] text-xs">SIM TIME</span>
          <span className="text-[#e2e8f0] font-mono text-sm">
            {formatSimTime(simulationTime)}
          </span>
        </div>

        <span
          className={clsx(
            'px-2 py-0.5 rounded text-xs font-medium',
            isRunning
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-[#2a2a3e] text-[#94a3b8]',
          )}
        >
          {speedMultiplier}x
        </span>

        {isRunning && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs">LIVE</span>
          </span>
        )}
      </div>

      {/* Right: Toggle buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={startTutorial}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors bg-transparent text-[#94a3b8] hover:text-[#e2e8f0]"
          title="Start tutorial"
        >
          <GraduationCap size={14} />
          Tutorial
          {!tutorialCompleted && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLabels}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors',
            showLabels
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-[#1a1a2e] text-[#94a3b8] hover:text-[#e2e8f0]',
          )}
          title="Toggle labels"
        >
          {showLabels ? <Eye size={14} /> : <EyeOff size={14} />}
          Labels
        </button>

        <button
          onClick={toggleParticles}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors',
            showParticles
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-[#1a1a2e] text-[#94a3b8] hover:text-[#e2e8f0]',
          )}
          title="Toggle particles"
        >
          {showParticles ? <Eye size={14} /> : <EyeOff size={14} />}
          Particles
        </button>
      </div>
    </header>
  )
}
