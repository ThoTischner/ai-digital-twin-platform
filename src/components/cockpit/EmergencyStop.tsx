import React, { useState } from 'react'
import clsx from 'clsx'
import { useControlStore } from '../../engine/store/controlStore'

const EmergencyStop: React.FC = () => {
  const emergencyStop = useControlStore((s) => s.emergencyStop)
  const triggerEmergencyStop = useControlStore((s) => s.triggerEmergencyStop)
  const resetEmergencyStop = useControlStore((s) => s.resetEmergencyStop)
  const [confirmReset, setConfirmReset] = useState(false)

  const handlePress = () => {
    if (!emergencyStop) {
      triggerEmergencyStop()
      setConfirmReset(false)
    } else if (!confirmReset) {
      setConfirmReset(true)
    } else {
      resetEmergencyStop()
      setConfirmReset(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handlePress}
        className={clsx(
          'w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center',
          'font-bold text-white uppercase tracking-wider transition-all duration-200',
          'focus:outline-none cursor-pointer select-none',
          emergencyStop
            ? 'bg-red-900 border-red-700 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
            : 'bg-red-600 border-red-800 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        )}
      >
        <span className="text-xs font-black leading-tight">
          {emergencyStop ? 'ACTIVE' : 'E-STOP'}
        </span>
      </button>
      {emergencyStop && (
        <span className="text-xs text-red-400 text-center">
          {confirmReset ? 'Press again to reset' : 'Press to reset systems'}
        </span>
      )}
    </div>
  )
}

export default EmergencyStop
