import { create } from 'zustand'
import { SensorState, SensorReading, HealthStatus } from '../../types/sensor'
import { SENSORS } from '../../config/sensorConfig'

const MAX_READINGS = 500

interface SensorStoreState {
  sensors: Record<string, SensorState>
}

interface SensorStoreActions {
  updateReading: (sensorId: string, reading: SensorReading) => void
  setSensorHealth: (sensorId: string, health: HealthStatus) => void
  overrideSensorValue: (sensorId: string, value: number) => void
  getSensorsByEquipment: (equipmentId: string) => SensorState[]
  getAnomalousSensors: () => SensorState[]
}

function buildInitialSensors(): Record<string, SensorState> {
  const sensors: Record<string, SensorState> = {}
  for (const config of SENSORS) {
    sensors[config.id] = {
      config,
      currentValue: config.baseValue,
      health: 'normal',
      readings: [],
      anomalyScore: 0,
      trend: 'stable',
      rateOfChange: 0,
    }
  }
  return sensors
}

export const useSensorStore = create<SensorStoreState & SensorStoreActions>()(
  (set, get) => ({
    sensors: buildInitialSensors(),

    updateReading: (sensorId, reading) =>
      set((state) => {
        const sensor = state.sensors[sensorId]
        if (!sensor) return state

        const readings = [...sensor.readings, reading]
        if (readings.length > MAX_READINGS) {
          readings.splice(0, readings.length - MAX_READINGS)
        }

        const prevValue = sensor.currentValue
        const rateOfChange = reading.value - prevValue
        let trend: SensorState['trend'] = 'stable'
        if (rateOfChange > 0.1) trend = 'rising'
        else if (rateOfChange < -0.1) trend = 'falling'

        return {
          sensors: {
            ...state.sensors,
            [sensorId]: {
              ...sensor,
              currentValue: reading.value,
              anomalyScore: reading.anomalyScore,
              readings,
              trend,
              rateOfChange,
            },
          },
        }
      }),

    setSensorHealth: (sensorId, health) =>
      set((state) => {
        const sensor = state.sensors[sensorId]
        if (!sensor) return state

        return {
          sensors: {
            ...state.sensors,
            [sensorId]: { ...sensor, health },
          },
        }
      }),

    overrideSensorValue: (sensorId, value) =>
      set((state) => {
        const sensor = state.sensors[sensorId]
        if (!sensor) return state

        return {
          sensors: {
            ...state.sensors,
            [sensorId]: { ...sensor, currentValue: value },
          },
        }
      }),

    getSensorsByEquipment: (equipmentId) => {
      const { sensors } = get()
      return Object.values(sensors).filter(
        (s) => s.config.equipmentId === equipmentId,
      )
    },

    getAnomalousSensors: () => {
      const { sensors } = get()
      return Object.values(sensors).filter((s) => s.health !== 'normal')
    },
  }),
)
