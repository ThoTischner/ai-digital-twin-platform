import { FailureScenario } from '../types/scenario'

export const SCENARIOS: FailureScenario[] = [
  {
    id: 'pump-bearing',
    name: 'Pump Bearing Degradation',
    description: 'Gradual bearing wear in P-101 causing increasing vibration, temperature rise, and eventual flow reduction',
    category: 'mechanical',
    affectedEquipment: ['P-101'],
    affectedSensors: ['S-P101-VIB', 'S-P101-TEMP', 'S-P101-RPM', 'S-F301-FLOW'],
    expectedDetectionTime: 15,
    estimatedCostImpact: 45000,
    phases: [
      {
        name: 'early_wear',
        duration: 30,
        description: 'Subtle vibration increase — within normal range but trending upward',
        sensorEffects: {
          'S-P101-VIB': { targetValue: 5.0, rateOfChange: 0.05 },
          'S-P101-TEMP': { targetValue: 55, rateOfChange: 0.1 },
        },
      },
      {
        name: 'progressing',
        duration: 30,
        description: 'Vibration now clearly elevated, temperature rising, slight flow impact',
        sensorEffects: {
          'S-P101-VIB': { targetValue: 9.0, rateOfChange: 0.15, noiseMultiplier: 2.0 },
          'S-P101-TEMP': { targetValue: 72, rateOfChange: 0.3 },
          'S-F301-FLOW': { targetValue: 95, rateOfChange: -0.2 },
        },
      },
      {
        name: 'critical',
        duration: 20,
        description: 'Severe vibration, high temperature, significant flow loss',
        sensorEffects: {
          'S-P101-VIB': { targetValue: 18.0, rateOfChange: 0.4, noiseMultiplier: 3.0 },
          'S-P101-TEMP': { targetValue: 95, rateOfChange: 0.5 },
          'S-P101-RPM': { targetValue: 1200, rateOfChange: -3.0 },
          'S-F301-FLOW': { targetValue: 65, rateOfChange: -0.8 },
        },
      },
    ],
  },
  {
    id: 'filter-clog',
    name: 'Filter Clogging',
    description: 'Primary filter F-301 progressively clogging — pressure differential rises, flow drops, downstream turbidity increases',
    category: 'process',
    affectedEquipment: ['F-301', 'T-202'],
    affectedSensors: ['S-F301-PRES', 'S-F301-FLOW', 'S-T202-TURB'],
    expectedDetectionTime: 20,
    estimatedCostImpact: 12000,
    phases: [
      {
        name: 'buildup',
        duration: 35,
        description: 'Pressure slowly rising as filter media accumulates particulates',
        sensorEffects: {
          'S-F301-PRES': { targetValue: 4.0, rateOfChange: 0.03 },
          'S-F301-FLOW': { targetValue: 95, rateOfChange: -0.2 },
        },
      },
      {
        name: 'restricted',
        duration: 25,
        description: 'Clear pressure differential, flow reduced, turbidity starting to increase downstream',
        sensorEffects: {
          'S-F301-PRES': { targetValue: 6.5, rateOfChange: 0.08 },
          'S-F301-FLOW': { targetValue: 65, rateOfChange: -0.5 },
          'S-T202-TURB': { targetValue: 6.0, rateOfChange: 0.05 },
        },
      },
      {
        name: 'bypass',
        duration: 15,
        description: 'Near-total clogging — water bypassing filter media',
        sensorEffects: {
          'S-F301-PRES': { targetValue: 8.5, rateOfChange: 0.1 },
          'S-F301-FLOW': { targetValue: 35, rateOfChange: -1.0 },
          'S-T202-TURB': { targetValue: 15.0, rateOfChange: 0.2 },
        },
      },
    ],
  },
  {
    id: 'chemical-imbalance',
    name: 'Chemical Imbalance',
    description: 'pH drifting out of range due to dosing malfunction, causing coagulation failure and turbidity increase',
    category: 'chemical',
    affectedEquipment: ['D-501', 'T-202'],
    affectedSensors: ['S-T202-PH', 'S-T202-TURB'],
    expectedDetectionTime: 10,
    estimatedCostImpact: 8000,
    phases: [
      {
        name: 'drift',
        duration: 25,
        description: 'pH slowly drifting upward as dosing pump loses calibration',
        sensorEffects: {
          'S-T202-PH': { targetValue: 8.2, rateOfChange: 0.02 },
        },
      },
      {
        name: 'coagulation_failure',
        duration: 25,
        description: 'pH too high for effective coagulation — turbidity rising',
        sensorEffects: {
          'S-T202-PH': { targetValue: 9.0, rateOfChange: 0.03 },
          'S-T202-TURB': { targetValue: 12.0, rateOfChange: 0.15 },
        },
      },
    ],
  },
  {
    id: 'tank-overflow',
    name: 'Tank Overflow Risk',
    description: 'Intake valve stuck open while outflow reduced — raw water tank level rising toward overflow',
    category: 'hydraulic',
    affectedEquipment: ['V-101', 'T-201'],
    affectedSensors: ['S-T201-LVL', 'S-V101-FLOW'],
    expectedDetectionTime: 12,
    estimatedCostImpact: 25000,
    phases: [
      {
        name: 'rising',
        duration: 30,
        description: 'Level steadily rising — intake exceeding outflow',
        sensorEffects: {
          'S-T201-LVL': { targetValue: 85, rateOfChange: 0.5 },
          'S-V101-FLOW': { targetValue: 155, rateOfChange: 0.3 },
        },
      },
      {
        name: 'high_level',
        duration: 20,
        description: 'Level approaching critical — overflow imminent',
        sensorEffects: {
          'S-T201-LVL': { targetValue: 97, rateOfChange: 0.3 },
          'S-V101-FLOW': { targetValue: 165, rateOfChange: 0.1 },
        },
      },
    ],
  },
  {
    id: 'cascading',
    name: 'Cascading Failure',
    description: 'Pump degradation triggers downstream effects — reduced flow causes filter issues and tank level changes',
    category: 'systemic',
    affectedEquipment: ['P-101', 'F-301', 'T-201', 'T-303'],
    affectedSensors: ['S-P101-VIB', 'S-P101-TEMP', 'S-F301-FLOW', 'S-F301-PRES', 'S-T201-LVL', 'S-T303-LVL'],
    expectedDetectionTime: 20,
    estimatedCostImpact: 75000,
    phases: [
      {
        name: 'pump_degradation',
        duration: 25,
        description: 'Primary pump showing wear signs',
        sensorEffects: {
          'S-P101-VIB': { targetValue: 8.0, rateOfChange: 0.12 },
          'S-P101-TEMP': { targetValue: 70, rateOfChange: 0.3 },
        },
      },
      {
        name: 'flow_impact',
        duration: 25,
        description: 'Reduced pump output affects filter and tanks',
        sensorEffects: {
          'S-P101-VIB': { targetValue: 14.0, rateOfChange: 0.2 },
          'S-F301-FLOW': { targetValue: 60, rateOfChange: -0.8 },
          'S-F301-PRES': { targetValue: 1.2, rateOfChange: -0.03 },
          'S-T201-LVL': { targetValue: 80, rateOfChange: 0.3 },
          'S-T303-LVL': { targetValue: 35, rateOfChange: -0.4 },
        },
      },
      {
        name: 'system_stress',
        duration: 20,
        description: 'Multiple systems under stress — immediate action required',
        sensorEffects: {
          'S-P101-VIB': { targetValue: 22.0, rateOfChange: 0.3, noiseMultiplier: 3.0 },
          'S-P101-TEMP': { targetValue: 90, rateOfChange: 0.4 },
          'S-F301-FLOW': { targetValue: 30, rateOfChange: -1.0 },
          'S-T303-LVL': { targetValue: 20, rateOfChange: -0.6 },
        },
      },
    ],
  },
]

export const AUTO_DEMO_SEQUENCE = [
  { scenarioId: null, duration: 15, speedMultiplier: 10, label: 'Normal Operations' },
  { scenarioId: 'pump-bearing', duration: 80, speedMultiplier: 10, label: 'Pump Bearing Degradation' },
  { scenarioId: null, duration: 10, speedMultiplier: 10, label: 'Recovery Period' },
  { scenarioId: 'filter-clog', duration: 75, speedMultiplier: 10, label: 'Filter Clogging' },
  { scenarioId: null, duration: 10, speedMultiplier: 1, label: 'Summary' },
]
