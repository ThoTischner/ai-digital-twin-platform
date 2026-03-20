import React, { useState } from 'react'
import clsx from 'clsx'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import ControlModeSelector from './ControlModeSelector'
import EmergencyStop from './EmergencyStop'
import PumpControl from './PumpControl'
import ValveControl from './ValveControl'
import DosingControl from './DosingControl'
import FilterControl from './FilterControl'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-[#2a2a3e] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider',
          'text-[#94a3b8] bg-[#0a0a0f]/50 hover:bg-[#1a1a2e]/50 transition-colors',
          'cursor-pointer focus:outline-none',
        )}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {isOpen && <div className="p-2 space-y-2">{children}</div>}
    </div>
  )
}

const CockpitPanel: React.FC = () => {
  const manualOverrides = useControlStore((s) => s.manualOverrides)
  const activeOverrideCount = Object.values(manualOverrides).filter((o) => o.active).length

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-[#2a2a3e] scrollbar-track-transparent">
        {/* Control Mode Selector */}
        <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3">
          <ControlModeSelector />
        </div>

        {/* Emergency Stop */}
        <div className="flex justify-center py-2">
          <EmergencyStop />
        </div>

        {/* Pumps */}
        <CollapsibleSection title="Pumps">
          <PumpControl equipmentId="P-101" />
          <PumpControl equipmentId="P-102" />
          <PumpControl equipmentId="P-401" />
        </CollapsibleSection>

        {/* Valves */}
        <CollapsibleSection title="Valves">
          <ValveControl equipmentId="V-101" />
          <ValveControl equipmentId="V-401" />
        </CollapsibleSection>

        {/* Chemical Dosing */}
        <CollapsibleSection title="Chemical Dosing">
          <DosingControl equipmentId="D-501" />
        </CollapsibleSection>

        {/* Filtration */}
        <CollapsibleSection title="Filtration">
          <FilterControl equipmentId="F-301" />
          <FilterControl equipmentId="F-302" />
        </CollapsibleSection>
      </div>

      {/* Quick status bar */}
      <div className="shrink-0 px-3 py-2 border-t border-[#2a2a3e] bg-[#12121a]">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#94a3b8] uppercase tracking-wider">Active Overrides</span>
          <span
            className={clsx(
              'font-mono font-bold',
              activeOverrideCount > 0 ? 'text-amber-400' : 'text-emerald-400',
            )}
          >
            {activeOverrideCount}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CockpitPanel
