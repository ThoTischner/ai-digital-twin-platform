import { Vector3Tuple } from 'three'

export type EquipmentType =
  | 'pump'
  | 'tank'
  | 'valve'
  | 'filter'
  | 'chemical_dosing'
  | 'uv_treatment'
  | 'building'

export interface EquipmentConfig {
  id: string
  name: string
  type: EquipmentType
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple
  sensorIds: string[]
  connections: string[]
  description: string
}
