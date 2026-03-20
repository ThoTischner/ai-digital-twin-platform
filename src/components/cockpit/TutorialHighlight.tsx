import React from 'react'
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import { TUTORIAL_STEPS } from '../../config/tutorialSteps'

/**
 * Renders a small animated indicator near the section matching
 * the current tutorial step's target. Cockpit components should
 * set `data-tutorial-target="<id>"` on wrapper elements so this
 * component can locate them at runtime.
 */

const TARGET_LABELS: Record<string, string> = {
  'mode-selector': 'Mode Selector',
  'time-controls': 'Time Controls',
  'P-101': 'Pump P-101',
  'V-101': 'Valve V-101',
  'D-501': 'Dosing D-501',
  'F-301': 'Filter F-301',
  'sensor-grid': 'Sensor Grid',
  '3d-view': '3D View',
  'emergency-stop': 'E-STOP',
  'fault-injector': 'Fault Injector',
}

const TutorialHighlight: React.FC = () => {
  const tutorialActive = useControlStore((s) => s.tutorialActive)
  const tutorialStep = useControlStore((s) => s.tutorialStep)

  if (!tutorialActive) return null

  const step = TUTORIAL_STEPS[Math.min(tutorialStep, TUTORIAL_STEPS.length - 1)]

  if (!step.target) return null

  const label = TARGET_LABELS[step.target] ?? step.target

  return (
    <HighlightBadge target={step.target} label={label} />
  )
}

interface HighlightBadgeProps {
  target: string
  label: string
}

const HighlightBadge: React.FC<HighlightBadgeProps> = ({ target, label }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<{
    top: number
    left: number
  } | null>(null)

  React.useEffect(() => {
    const locate = () => {
      const el = document.querySelector(`[data-tutorial-target="${target}"]`)
      if (el) {
        const rect = el.getBoundingClientRect()
        setPosition({
          top: rect.top + rect.height / 2 - 14,
          left: rect.left - 8,
        })
      } else {
        setPosition(null)
      }
    }

    locate()
    const interval = setInterval(locate, 500)
    window.addEventListener('resize', locate)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', locate)
    }
  }, [target])

  // Fallback: if we can't find the element, render an inline badge
  if (!position) {
    return (
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <div
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5',
            'bg-blue-600/90 backdrop-blur-sm',
            'border border-blue-400/40 rounded-full',
            'text-xs font-medium text-white',
            'animate-pulse',
          )}
        >
          <ArrowRight className="h-3 w-3" />
          Look for: {label}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 pointer-events-none"
      style={{ top: position.top, left: position.left }}
    >
      {/* Pulsing ring */}
      <div className="relative">
        <div
          className={clsx(
            'absolute -inset-2 rounded-full',
            'border-2 border-blue-400/60',
            'animate-ping',
          )}
        />
        <div
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1',
            'bg-blue-600/90 backdrop-blur-sm',
            'border border-blue-400/50 rounded-full',
            'text-xs font-medium text-white',
            'shadow-lg shadow-blue-500/20',
            'whitespace-nowrap',
            '-translate-x-full -translate-y-1/2',
          )}
        >
          <ArrowRight className="h-3 w-3 animate-bounce-x" />
          {label}
        </div>
      </div>
    </div>
  )
}

export default TutorialHighlight
