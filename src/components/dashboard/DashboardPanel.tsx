import React from 'react'
import { useAgentStore } from '../../engine/store/agentStore'
import { TimeControls } from './TimeControls'
import { HealthOverview } from './HealthOverview'
import { AgentThinking } from './AgentThinking'
import { AgentLog } from './AgentLog'
import { SensorGrid } from './SensorGrid'
import { AnomalyTimeline } from './AnomalyTimeline'
import { CostTracker } from './CostTracker'
import { FaultInjector } from './FaultInjector'

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <h3 className="text-[10px] uppercase tracking-widest text-[#94a3b8]/60 font-medium mt-1">
    {label}
  </h3>
)

export const DashboardPanel: React.FC = () => {
  const isThinking = useAgentStore((s) => s.isThinking)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#12121a] p-4 gap-4 scrollbar-thin">
      <TimeControls />

      <SectionHeader label="System Health" />
      <HealthOverview />

      {isThinking && (
        <>
          <SectionHeader label="AI Analysis" />
          <AgentThinking />
        </>
      )}

      <SectionHeader label="Agent Activity" />
      <AgentLog />

      <SectionHeader label="Sensors" />
      <SensorGrid />

      <SectionHeader label="Anomaly Timeline" />
      <AnomalyTimeline />

      <SectionHeader label="Cost Avoidance" />
      <CostTracker />

      <SectionHeader label="Fault Injection" />
      <FaultInjector />
    </div>
  )
}
