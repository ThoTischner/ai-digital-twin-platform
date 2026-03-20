export class NarrativeGenerator {
  generateDetection(
    sensorId: string,
    score: number,
    method: string,
    value: number,
    unit: string,
  ): string {
    const severity = score > 0.8 ? 'Critical' : score > 0.5 ? 'Warning' : 'Advisory'
    const templates = [
      `Anomaly detected on ${sensorId}: current reading of ${value.toFixed(1)} ${unit} flagged by ${method} analysis (score: ${score.toFixed(2)}). Severity: ${severity}.`,
      `${severity} anomaly on ${sensorId} \u2014 ${method} detection triggered at ${value.toFixed(1)} ${unit}. Confidence score: ${(score * 100).toFixed(0)}%.`,
      `Sensor ${sensorId} reading of ${value.toFixed(1)} ${unit} is abnormal. ${method} analysis returned a score of ${score.toFixed(2)}, classified as ${severity.toLowerCase()}.`,
      `${method} analysis flagged ${sensorId} at ${value.toFixed(1)} ${unit}. This ${severity.toLowerCase()}-level anomaly (score ${score.toFixed(2)}) may indicate developing equipment issues.`,
      `Monitoring alert: ${sensorId} shows ${severity.toLowerCase()}-level deviation at ${value.toFixed(1)} ${unit}. Detection method: ${method}, anomaly score: ${score.toFixed(2)}.`,
      `Detected unusual behavior on ${sensorId}: ${value.toFixed(1)} ${unit} via ${method} (${severity.toLowerCase()} severity, score ${score.toFixed(2)}). Recommending closer monitoring.`,
      `${sensorId} anomaly identified through ${method}: value ${value.toFixed(1)} ${unit} represents a ${severity.toLowerCase()}-level deviation from expected operating parameters.`,
      `${severity} on ${sensorId}: ${method} flagged current reading (${value.toFixed(1)} ${unit}) with an anomaly score of ${score.toFixed(2)}. This pattern is consistent with early equipment degradation.`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  generatePrediction(
    sensorId: string,
    timeToThreshold: string,
    confidence: number,
  ): string {
    const confPct = (confidence * 100).toFixed(0)
    const templates = [
      `Based on the current degradation trend, ${sensorId} is predicted to reach its threshold in approximately ${timeToThreshold} (confidence: ${confPct}%).`,
      `Predictive analysis for ${sensorId}: threshold breach estimated in ${timeToThreshold}. Model confidence: ${confPct}%.`,
      `Trend projection indicates ${sensorId} will exceed safe operating limits within ${timeToThreshold}. Confidence level: ${confPct}%.`,
      `Failure prediction for ${sensorId}: at the current rate, threshold will be reached in approximately ${timeToThreshold} (${confPct}% confidence). Preventive action recommended.`,
      `Early warning: ${sensorId} trending toward threshold breach in ~${timeToThreshold}. Regression model confidence: ${confPct}%.`,
      `${sensorId} degradation analysis projects threshold crossing in ${timeToThreshold}. Statistical confidence: ${confPct}%. Maintenance window should be scheduled.`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  generateAction(
    action: string,
    reason: string,
    equipment: string,
  ): string {
    const actionLabels: Record<string, string> = {
      reduce_pump_speed: 'Reducing pump speed',
      switch_to_backup_filter: 'Switching to backup filter',
      reduce_intake: 'Reducing intake flow',
      adjust_dosing: 'Adjusting chemical dosing',
      increase_intake: 'Increasing intake flow',
    }
    const label = actionLabels[action] ?? action

    const templates = [
      `Executing autonomous action: ${label} on ${equipment}. ${reason}`,
      `${label} on ${equipment} to mitigate detected issue. ${reason}`,
      `Automated response initiated: ${label} (${equipment}). ${reason}`,
      `Taking corrective action on ${equipment}: ${label}. ${reason}`,
      `AI decision: ${label} for ${equipment}. Rationale: ${reason}`,
      `Preventive measure activated \u2014 ${label} on ${equipment}. ${reason}`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  generateCorrelation(
    sensorA: string,
    sensorB: string,
    explanation: string,
  ): string {
    const templates = [
      `Correlation break detected between ${sensorA} and ${sensorB}. ${explanation}`,
      `Cross-sensor analysis: relationship between ${sensorA} and ${sensorB} has deviated from expected behavior. ${explanation}`,
      `Anomalous correlation pattern: ${sensorA} \u2194 ${sensorB} no longer follows expected dynamics. ${explanation}`,
      `Inter-sensor dependency alert: ${sensorA} and ${sensorB} are exhibiting an unexpected relationship. ${explanation}`,
      `Process coupling anomaly: the expected link between ${sensorA} and ${sensorB} appears broken. ${explanation}`,
      `Multi-sensor analysis reveals correlation breakdown between ${sensorA} and ${sensorB}. ${explanation}`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  generateResolution(
    equipment: string,
    details: string,
  ): string {
    const templates = [
      `Issue on ${equipment} has been resolved. ${details}`,
      `${equipment} returning to normal operating parameters. ${details}`,
      `Resolution confirmed for ${equipment}: ${details}`,
      `Condition on ${equipment} stabilized. ${details} Resuming standard monitoring.`,
      `${equipment} recovery complete. ${details} All readings within normal range.`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }
}
