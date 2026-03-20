import React from 'react'
import { Brain, CheckCircle2, Circle } from 'lucide-react'
import clsx from 'clsx'
import { useAgentStore } from '../../engine/store/agentStore'

export const AgentThinking: React.FC = () => {
  const isThinking = useAgentStore((s) => s.isThinking)
  const analysis = useAgentStore((s) => s.currentAnalysis)

  if (!isThinking || !analysis) return null

  const steps = analysis.currentSteps

  return (
    <div
      className={clsx(
        'bg-[#1a1a2e] rounded-lg p-3 border border-blue-500/30',
        'shadow-[0_0_15px_rgba(59,130,246,0.08)]',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <Brain size={16} className="text-blue-400" />
        <span className="text-blue-400 text-xs font-semibold tracking-wide">
          AI Analyzing
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        {analysis.currentPhase && (
          <span className="ml-auto text-[10px] text-[#94a3b8]">
            {analysis.currentPhase}
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-1.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            {step.completed ? (
              <CheckCircle2 size={13} className="text-green-400 shrink-0 mt-0.5" />
            ) : (
              <Circle size={13} className="text-[#94a3b8]/40 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <span
                className={clsx(
                  'text-[11px]',
                  step.completed ? 'text-[#e2e8f0]' : 'text-[#94a3b8]',
                )}
              >
                {step.step}
              </span>
              {step.detail && (
                <p className="text-[10px] text-[#94a3b8]/60 mt-0.5">
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
