import React, { useState } from 'react'
import { Info, AlertTriangle, AlertCircle, ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { useAgentStore } from '../../engine/store/agentStore'
import { severityColors } from '../../utils/colors'
import { formatDuration, formatConfidence } from '../../utils/format'
import type { AgentLogEntry, Severity } from '../../types/agent'

const severityIcons: Record<Severity, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
}

const LogEntry: React.FC<{ entry: AgentLogEntry }> = ({ entry }) => {
  const [expanded, setExpanded] = useState(false)
  const Icon = severityIcons[entry.severity]
  const color = severityColors[entry.severity]

  return (
    <div
      className={clsx(
        'bg-[#1a1a2e] rounded-lg p-2.5 border border-[#2a2a3e] transition-all',
        'animate-[slideIn_0.3s_ease-out]',
      )}
    >
      <div
        className="flex items-start gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Severity icon */}
        <Icon size={14} color={color} className="shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          {/* Title + time */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#e2e8f0] text-xs font-medium truncate">
              {entry.title}
            </span>
            <span className="text-[#94a3b8] text-[10px] shrink-0">
              {formatDuration(entry.timestamp)}
            </span>
          </div>

          {/* Confidence bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-[#2a2a3e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${entry.confidence * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="text-[10px] text-[#94a3b8]">
              {formatConfidence(entry.confidence)}
            </span>
          </div>

          {/* Action badge */}
          {entry.action && (
            <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400">
              {entry.action}
            </span>
          )}
        </div>

        {/* Expand toggle */}
        {expanded ? (
          <ChevronDown size={12} className="text-[#94a3b8] shrink-0 mt-0.5" />
        ) : (
          <ChevronRight size={12} className="text-[#94a3b8] shrink-0 mt-0.5" />
        )}
      </div>

      {/* Expanded explanation */}
      {expanded && (
        <div className="mt-2 ml-6 text-[11px] text-[#94a3b8] leading-relaxed">
          {entry.explanation}
        </div>
      )}
    </div>
  )
}

export const AgentLog: React.FC = () => {
  const log = useAgentStore((s) => s.log)

  return (
    <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto scrollbar-thin">
      {log.length === 0 ? (
        <div className="text-[#94a3b8]/50 text-xs text-center py-4">
          No agent activity yet. Start the simulation.
        </div>
      ) : (
        log.map((entry) => <LogEntry key={entry.id} entry={entry} />)
      )}
    </div>
  )
}
