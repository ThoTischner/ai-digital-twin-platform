import React from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import clsx from 'clsx'
import { useSceneStore } from '../../engine/store/sceneStore'
import { useControlStore } from '../../engine/store/controlStore'
import { Header } from './Header'
import { DashboardPanel } from '../dashboard/DashboardPanel'
import CockpitPanel from '../cockpit/CockpitPanel'
import TutorialOverlay from '../cockpit/TutorialOverlay'
import TutorialHighlight from '../cockpit/TutorialHighlight'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dashboardCollapsed = useSceneStore((s) => s.dashboardCollapsed)
  const toggleDashboard = useSceneStore((s) => s.toggleDashboard)
  const activePanel = useSceneStore((s) => s.activePanel)
  const tutorialActive = useControlStore((s) => s.tutorialActive)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 3D Scene Area */}
        <div className="flex-1 relative overflow-hidden">
          {children}

          {/* Dashboard toggle button */}
          <button
            onClick={toggleDashboard}
            className={clsx(
              'absolute top-3 right-3 z-10 p-2 rounded-lg transition-colors',
              'bg-[#1a1a2e]/80 backdrop-blur-sm border border-[#2a2a3e]',
              'hover:bg-[#2a2a3e] text-[#94a3b8] hover:text-[#e2e8f0]',
            )}
            title={dashboardCollapsed ? 'Open dashboard' : 'Close dashboard'}
          >
            {dashboardCollapsed ? (
              <PanelRightOpen size={18} />
            ) : (
              <PanelRightClose size={18} />
            )}
          </button>
        </div>

        {/* Side Panel */}
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-in-out border-l border-[#2a2a3e]',
            dashboardCollapsed ? 'w-0 overflow-hidden' : 'w-[480px] min-w-[480px]',
          )}
        >
          {activePanel === 'dashboard' ? <DashboardPanel /> : <CockpitPanel />}
        </div>
      </div>

      <TutorialOverlay />
      {tutorialActive && <TutorialHighlight />}
    </div>
  )
}
