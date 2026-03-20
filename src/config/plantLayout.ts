import { EquipmentConfig } from '../types/equipment'

export const EQUIPMENT: EquipmentConfig[] = [
  // === INTAKE ZONE (x: -20 to -10) ===
  {
    id: 'V-101',
    name: 'Intake Valve',
    type: 'valve',
    position: [-20, 0, 0],
    sensorIds: ['S-V101-FLOW'],
    connections: ['P-101'],
    description: 'Main water intake control valve',
  },
  {
    id: 'P-101',
    name: 'Primary Pump',
    type: 'pump',
    position: [-15, 0, 0],
    sensorIds: ['S-P101-VIB', 'S-P101-TEMP', 'S-P101-RPM'],
    connections: ['V-101', 'T-201'],
    description: 'Primary intake pump — feeds raw water tank',
  },
  {
    id: 'P-102',
    name: 'Backup Pump',
    type: 'pump',
    position: [-15, 0, 5],
    sensorIds: ['S-P102-VIB', 'S-P102-TEMP'],
    connections: ['V-101', 'T-201'],
    description: 'Standby pump — activated on primary pump failure',
  },

  // === RAW WATER ZONE (x: -8 to -2) ===
  {
    id: 'T-201',
    name: 'Raw Water Tank',
    type: 'tank',
    position: [-5, 0, 0],
    scale: [1.5, 1.5, 1.5],
    sensorIds: ['S-T201-LVL', 'S-T201-TEMP'],
    connections: ['P-101', 'T-202'],
    description: 'Raw water holding tank — 500m³ capacity',
  },

  // === TREATMENT ZONE (x: 0 to 10) ===
  {
    id: 'D-501',
    name: 'Chemical Dosing',
    type: 'chemical_dosing',
    position: [0, 0, -4],
    sensorIds: [],
    connections: ['T-202'],
    description: 'Coagulant and pH adjustment dosing system',
  },
  {
    id: 'T-202',
    name: 'Coagulation Tank',
    type: 'tank',
    position: [3, 0, 0],
    sensorIds: ['S-T202-PH', 'S-T202-TURB'],
    connections: ['T-201', 'F-301'],
    description: 'Coagulation/flocculation tank with mixer',
  },
  {
    id: 'F-301',
    name: 'Primary Filter',
    type: 'filter',
    position: [9, 0, -2],
    sensorIds: ['S-F301-PRES', 'S-F301-FLOW'],
    connections: ['T-202', 'F-302'],
    description: 'Primary sand/carbon filtration unit',
  },
  {
    id: 'F-302',
    name: 'Secondary Filter',
    type: 'filter',
    position: [9, 0, 3],
    sensorIds: ['S-F302-PRES'],
    connections: ['T-202', 'T-303'],
    description: 'Secondary polishing filter — backup path',
  },

  // === CLEAR WATER ZONE (x: 14 to 22) ===
  {
    id: 'U-601',
    name: 'UV Treatment',
    type: 'uv_treatment',
    position: [15, 0, 0],
    sensorIds: [],
    connections: ['F-301', 'T-303'],
    description: 'UV disinfection unit',
  },
  {
    id: 'T-303',
    name: 'Clear Water Tank',
    type: 'tank',
    position: [20, 0, 0],
    scale: [1.8, 1.5, 1.8],
    sensorIds: ['S-T303-LVL'],
    connections: ['U-601', 'P-401'],
    description: 'Treated water storage tank — 800m³ capacity',
  },

  // === DISTRIBUTION ZONE (x: 25+) ===
  {
    id: 'P-401',
    name: 'Distribution Pump',
    type: 'pump',
    position: [26, 0, 0],
    sensorIds: [],
    connections: ['T-303', 'V-401'],
    description: 'Distribution network pump',
  },
  {
    id: 'V-401',
    name: 'Distribution Valve',
    type: 'valve',
    position: [31, 0, 0],
    sensorIds: [],
    connections: ['P-401'],
    description: 'Distribution network control valve',
  },
]

export const PIPE_ROUTES: { from: string; to: string; waypoints?: [number, number, number][] }[] = [
  { from: 'V-101', to: 'P-101' },
  { from: 'P-101', to: 'T-201', waypoints: [[-10, 1, 0]] },
  { from: 'P-102', to: 'T-201', waypoints: [[-10, 1, 3], [-10, 1, 0]] },
  { from: 'T-201', to: 'T-202', waypoints: [[-1, 1, 0]] },
  { from: 'D-501', to: 'T-202', waypoints: [[0, 2, -2], [1, 2, 0]] },
  { from: 'T-202', to: 'F-301', waypoints: [[6, 1, 0], [6, 1, -2]] },
  { from: 'T-202', to: 'F-302', waypoints: [[6, 1, 0], [6, 1, 3]] },
  { from: 'F-301', to: 'U-601', waypoints: [[12, 1, -2], [12, 1, 0]] },
  { from: 'F-302', to: 'U-601', waypoints: [[12, 1, 3], [12, 1, 0]] },
  { from: 'U-601', to: 'T-303', waypoints: [[17, 1, 0]] },
  { from: 'T-303', to: 'P-401', waypoints: [[23, 1, 0]] },
  { from: 'P-401', to: 'V-401', waypoints: [[28, 1, 0]] },
]

export const getEquipmentById = (id: string): EquipmentConfig | undefined =>
  EQUIPMENT.find(e => e.id === id)
