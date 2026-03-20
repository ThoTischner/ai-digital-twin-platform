import React from 'react'
import clsx from 'clsx'
import { Bot, Hand, GitMerge, type LucideIcon } from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import { ControlMode } from '../../types/control'

const modes: {
  mode: ControlMode
  label: string
  icon: LucideIcon
  activeColor: string
  description: string
}[] = [
  {
    mode: 'auto',
    label: 'Auto',
    icon: Bot,
    activeColor: 'bg-blue-600 border-blue-500 text-blue-100',
    description: 'AI manages all systems autonomously',
  },
  {
    mode: 'hybrid',
    label: 'Hybrid',
    icon: GitMerge,
    activeColor: 'bg-purple-600 border-purple-500 text-purple-100',
    description: 'AI suggests actions, you approve',
  },
  {
    mode: 'manual',
    label: 'Manual',
    icon: Hand,
    activeColor: 'bg-amber-600 border-amber-500 text-amber-100',
    description: 'Full manual control of all systems',
  },
]

const ControlModeSelector: React.FC = () => {
  const currentMode = useControlStore((s) => s.mode)
  const setMode = useControlStore((s) => s.setMode)
  const activeConfig = modes.find((m) => m.mode === currentMode)!

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {modes.map(({ mode, label, icon: Icon, activeColor }) => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={clsx(
              'flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg border transition-all duration-200',
              'cursor-pointer focus:outline-none',
              currentMode === mode
                ? activeColor
                : 'bg-[#1a1a2e] border-[#2a2a3e] text-[#94a3b8] hover:bg-[#1a1a2e]/80 hover:border-[#3a3a4e]',
            )}
          >
            <Icon size={18} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#94a3b8] text-center">{activeConfig.description}</p>
    </div>
  )
}

export default ControlModeSelector
