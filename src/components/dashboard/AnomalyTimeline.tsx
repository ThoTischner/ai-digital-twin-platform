import React from 'react'
import clsx from 'clsx'
import { useAgentStore } from '../../engine/store/agentStore'
import { severityColors } from '../../utils/colors'
import { formatDuration } from '../../utils/format'

export const AnomalyTimeline: React.FC = () => {
  const log = useAgentStore((s) => s.log)

  // Filter to anomaly detection and prediction entries
  const events = log.filter(
    (e) => e.actionType === 'detect_anomaly' || e.actionType === 'predict_failure',
  )

  if (events.length === 0) {
    return (
      <div className="bg-[#1a1a2e] rounded-lg p-3 border border-[#2a2a3e]">
        <div className="text-[#94a3b8]/50 text-xs text-center py-2">
          No anomalies detected yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-3 border border-[#2a2a3e]">
      {/* Timeline bar */}
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-2 left-0 right-0 h-px bg-[#2a2a3e]" />

        {/* Events */}
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
          {events.slice(0, 12).map((event) => {
            const color = severityColors[event.severity]

            return (
              <div key={event.id} className="flex flex-col items-center shrink-0">
                {/* Dot */}
                <div
                  className={clsx(
                    'w-4 h-4 rounded-full border-2 z-10',
                    event.severity === 'critical' && 'animate-pulse',
                  )}
                  style={{
                    borderColor: color,
                    backgroundColor: `${color}33`,
                  }}
                />
                {/* Label */}
                <span className="text-[9px] text-[#94a3b8] mt-1.5 max-w-[80px] text-center leading-tight truncate">
                  {event.title}
                </span>
                <span className="text-[8px] text-[#94a3b8]/50 mt-0.5">
                  {formatDuration(event.timestamp)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detection stat */}
      {events.length > 0 && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2a2a3e]">
          <span className="text-[10px] text-[#94a3b8]">
            AI detected {events.length} anomal{events.length === 1 ? 'y' : 'ies'}
          </span>
          <span className="text-[10px] text-green-400">
            Avg. early detection
          </span>
        </div>
      )}
    </div>
  )
}
