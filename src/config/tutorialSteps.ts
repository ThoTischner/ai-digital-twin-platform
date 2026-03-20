import { TutorialStep } from '../types/control'

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description:
      'Welcome to the Water Treatment Plant Control Center. This tutorial will guide you through operating the plant.',
    position: 'center',
  },
  {
    id: 'overview',
    title: 'Plant Overview',
    description:
      'This is your Digital Twin \u2014 a real-time 3D simulation of a water treatment plant. The left side shows the 3D view, the right side shows your control panels.',
    position: 'center',
  },
  {
    id: 'control-modes',
    title: 'Control Modes',
    description:
      'Choose your control mode: AUTO lets the AI manage everything, MANUAL gives you full control, HYBRID lets the AI suggest while you decide.',
    target: 'mode-selector',
    position: 'bottom',
  },
  {
    id: 'switch-manual',
    title: 'Switch to Manual',
    description:
      'Try switching to MANUAL mode now to unlock all controls.',
    target: 'mode-selector',
    position: 'bottom',
    action: 'Click MANUAL',
  },
  {
    id: 'simulation-controls',
    title: 'Simulation Controls',
    description:
      'Use Play/Pause and speed controls to manage simulation time. Try 10x speed to see changes faster.',
    target: 'time-controls',
    position: 'bottom',
  },
  {
    id: 'pump-controls',
    title: 'Pump Controls',
    description:
      'Pumps are the heart of the plant. P-101 is the primary intake pump. You can start/stop it and adjust its RPM.',
    target: 'P-101',
    position: 'right',
  },
  {
    id: 'rpm-adjustment',
    title: 'RPM Adjustment',
    description:
      'Try adjusting P-101\u2019s RPM. Higher RPM = more flow but more stress on the pump. Watch the vibration and temperature sensors respond.',
    target: 'P-101',
    position: 'right',
    action: 'Adjust RPM slider',
  },
  {
    id: 'valve-controls',
    title: 'Valve Controls',
    description:
      'Valves control water flow between sections. V-101 controls the intake. Adjust its opening percentage.',
    target: 'V-101',
    position: 'right',
  },
  {
    id: 'chemical-dosing',
    title: 'Chemical Dosing',
    description:
      'The chemical dosing system maintains water pH. Adjust the target pH and dosing rate. Watch the pH sensor in the coagulation tank respond.',
    target: 'D-501',
    position: 'right',
  },
  {
    id: 'filter-management',
    title: 'Filter Management',
    description:
      'Filters F-301 and F-302 remove impurities. You can switch between primary and backup filters, or initiate backwash mode.',
    target: 'F-301',
    position: 'right',
  },
  {
    id: 'sensor-monitoring',
    title: 'Sensor Monitoring',
    description:
      'Watch the sensor charts in the dashboard. They show real-time data from all 14 sensors across the plant.',
    target: 'sensor-grid',
    position: 'top',
  },
  {
    id: 'health-indicators',
    title: 'Health Indicators',
    description:
      'The 3D view shows health rings under each piece of equipment: green = normal, amber = warning, red = critical. Glowing rings mean trouble!',
    target: '3d-view',
    position: 'left',
  },
  {
    id: 'emergency-stop',
    title: 'Emergency Stop',
    description:
      'The E-STOP button immediately shuts down all pumps and closes all valves. Use it in critical situations!',
    target: 'emergency-stop',
    position: 'top',
  },
  {
    id: 'fault-injection',
    title: 'Fault Injection',
    description:
      'Try injecting a fault to test your skills! Switch to the Dashboard tab and use the Fault Injector to simulate equipment failures.',
    target: 'fault-injector',
    position: 'top',
  },
  {
    id: 'ai-agent',
    title: 'AI Agent',
    description:
      'Switch to AUTO or HYBRID mode to see the AI agent detect anomalies, predict failures, and take corrective actions automatically.',
    position: 'center',
  },
  {
    id: 'camera-views',
    title: 'Camera Views',
    description:
      'Click equipment in the 3D view or use the preset camera positions (Overview, Intake, Treatment, Distribution) to navigate.',
    target: '3d-view',
    position: 'left',
  },
  {
    id: 'summary',
    title: 'You\u2019re Ready!',
    description:
      'You\u2019re ready to operate the plant! Remember: monitor sensors, respond to warnings, and use the AI agent when you need help. Have fun!',
    position: 'center',
  },
]
