import { create } from 'zustand'

type CameraPreset = 'overview' | 'intake' | 'treatment' | 'distribution' | 'custom'
type ActivePanel = 'dashboard' | 'cockpit'

interface SceneStoreState {
  selectedEquipmentId: string | null
  hoveredEquipmentId: string | null
  cameraPreset: CameraPreset
  showLabels: boolean
  showParticles: boolean
  dashboardCollapsed: boolean
  activePanel: ActivePanel
}

interface SceneStoreActions {
  selectEquipment: (id: string | null) => void
  hoverEquipment: (id: string | null) => void
  setCameraPreset: (preset: CameraPreset) => void
  toggleLabels: () => void
  toggleParticles: () => void
  toggleDashboard: () => void
  setActivePanel: (panel: ActivePanel) => void
}

export const useSceneStore = create<SceneStoreState & SceneStoreActions>()(
  (set) => ({
    selectedEquipmentId: null,
    hoveredEquipmentId: null,
    cameraPreset: 'overview',
    showLabels: true,
    showParticles: true,
    dashboardCollapsed: false,
    activePanel: 'dashboard',

    selectEquipment: (id) => set({ selectedEquipmentId: id }),

    hoverEquipment: (id) => set({ hoveredEquipmentId: id }),

    setCameraPreset: (preset) => set({ cameraPreset: preset }),

    toggleLabels: () =>
      set((state) => ({ showLabels: !state.showLabels })),

    toggleParticles: () =>
      set((state) => ({ showParticles: !state.showParticles })),

    toggleDashboard: () =>
      set((state) => ({ dashboardCollapsed: !state.dashboardCollapsed })),

    setActivePanel: (panel) => set({ activePanel: panel }),
  }),
)
