import React, { useEffect } from 'react'
import clsx from 'clsx'
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react'
import { useControlStore } from '../../engine/store/controlStore'
import { TUTORIAL_STEPS } from '../../config/tutorialSteps'

const TutorialOverlay: React.FC = () => {
  const tutorialActive = useControlStore((s) => s.tutorialActive)
  const tutorialStep = useControlStore((s) => s.tutorialStep)
  const tutorialCompleted = useControlStore((s) => s.tutorialCompleted)
  const startTutorial = useControlStore((s) => s.startTutorial)
  const nextTutorialStep = useControlStore((s) => s.nextTutorialStep)
  const prevTutorialStep = useControlStore((s) => s.prevTutorialStep)
  const completeTutorial = useControlStore((s) => s.completeTutorial)
  const skipTutorial = useControlStore((s) => s.skipTutorial)

  // Auto-show tutorial on first visit
  useEffect(() => {
    if (!tutorialCompleted && !tutorialActive) {
      startTutorial()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!tutorialActive) return null

  const totalSteps = TUTORIAL_STEPS.length
  const currentStep = TUTORIAL_STEPS[Math.min(tutorialStep, totalSteps - 1)]
  const isFirst = tutorialStep === 0
  const isLast = tutorialStep >= totalSteps - 1

  const handleNext = () => {
    if (isLast) {
      completeTutorial()
    } else {
      nextTutorialStep()
    }
  }

  const handleBack = () => {
    if (!isFirst) {
      prevTutorialStep()
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-8 z-50 flex justify-center pointer-events-none">
      <div
        className={clsx(
          'pointer-events-auto max-w-lg w-full mx-4',
          'bg-gray-900/80 backdrop-blur-xl',
          'border border-blue-500/30 rounded-xl',
          'shadow-2xl shadow-blue-500/10',
          'p-5',
          'animate-in fade-in slide-in-from-bottom-4 duration-300',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            <span className="text-xs text-gray-400 font-medium">
              Step {tutorialStep + 1} of {totalSteps}
            </span>
          </div>
          <button
            onClick={skipTutorial}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
            aria-label="Skip tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2">
          {currentStep.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-3">
          {currentStep.description}
        </p>

        {/* Action hint */}
        {currentStep.action && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-sm text-blue-300 font-medium">
              {currentStep.action}
            </span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={skipTutorial}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={isFirst}
              className={clsx(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isFirst
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/50',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className={clsx(
                'flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isLast
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white',
              )}
            >
              {isLast ? (
                <>
                  Finish
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={clsx(
                'rounded-full transition-all duration-200',
                i === tutorialStep
                  ? 'w-4 h-1.5 bg-blue-400'
                  : i < tutorialStep
                    ? 'w-1.5 h-1.5 bg-blue-600'
                    : 'w-1.5 h-1.5 bg-gray-600',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TutorialOverlay
