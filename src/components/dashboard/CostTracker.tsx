import React, { useEffect, useRef, useState } from 'react'
import { DollarSign, Activity, Shield } from 'lucide-react'
import { useAgentStore } from '../../engine/store/agentStore'
import { formatCost } from '../../utils/format'

export const CostTracker: React.FC = () => {
  const estimatedCostSaved = useAgentStore((s) => s.estimatedCostSaved)
  const totalAnomaliesDetected = useAgentStore((s) => s.totalAnomaliesDetected)
  const totalActionsExecuted = useAgentStore((s) => s.totalActionsExecuted)

  // Smooth counter animation
  const [displayCost, setDisplayCost] = useState(0)
  const rafRef = useRef<number>(0)
  const currentRef = useRef(0)

  useEffect(() => {
    const target = estimatedCostSaved
    const animate = () => {
      const diff = target - currentRef.current
      if (Math.abs(diff) < 1) {
        currentRef.current = target
        setDisplayCost(target)
        return
      }
      currentRef.current += diff * 0.08
      setDisplayCost(Math.round(currentRef.current))
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [estimatedCostSaved])

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-3 border border-[#2a2a3e]">
      {/* Main cost display */}
      <div className="flex items-center gap-2 mb-2">
        <DollarSign size={18} className="text-green-400" />
        <span className="text-green-400 text-2xl font-bold font-mono tracking-tight">
          {formatCost(displayCost)}
        </span>
      </div>
      <p className="text-[10px] text-[#94a3b8] mb-3">
        Estimated cost avoidance from AI interventions
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-blue-400" />
          <span className="text-[11px] text-[#e2e8f0]">{totalAnomaliesDetected}</span>
          <span className="text-[10px] text-[#94a3b8]">detected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-purple-400" />
          <span className="text-[11px] text-[#e2e8f0]">{totalActionsExecuted}</span>
          <span className="text-[10px] text-[#94a3b8]">actions</span>
        </div>
      </div>
    </div>
  )
}
