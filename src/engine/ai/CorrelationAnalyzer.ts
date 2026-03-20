import { pearsonCorrelation } from '../../utils/math'

const CORRELATION_WINDOW = 30
const MAGNITUDE_THRESHOLD = 0.3

export interface CorrelationBreak {
  sensorA: string
  sensorB: string
  expected: 'positive' | 'negative'
  actual: number
  severity: 'warning' | 'critical'
  explanation: string
}

interface CorrelationPair {
  a: string
  b: string
  expected: 'positive' | 'negative'
}

const EXPECTED_CORRELATIONS: CorrelationPair[] = [
  { a: 'S-P101-VIB', b: 'S-P101-TEMP', expected: 'positive' },
  { a: 'S-P101-RPM', b: 'S-F301-FLOW', expected: 'positive' },
  { a: 'S-F301-PRES', b: 'S-F301-FLOW', expected: 'negative' },
  { a: 'S-T202-PH', b: 'S-T202-TURB', expected: 'negative' },
]

export class CorrelationAnalyzer {
  analyze(sensorReadings: Record<string, number[]>): CorrelationBreak[] {
    const breaks: CorrelationBreak[] = []

    for (const pair of EXPECTED_CORRELATIONS) {
      const aValues = sensorReadings[pair.a]
      const bValues = sensorReadings[pair.b]

      if (!aValues || !bValues) continue
      if (aValues.length < CORRELATION_WINDOW || bValues.length < CORRELATION_WINDOW) continue

      const aWindow = aValues.slice(-CORRELATION_WINDOW)
      const bWindow = bValues.slice(-CORRELATION_WINDOW)

      const r = pearsonCorrelation(aWindow, bWindow)

      const signMatches =
        (pair.expected === 'positive' && r > 0) ||
        (pair.expected === 'negative' && r < 0)

      const magnitudeWeak = Math.abs(r) < MAGNITUDE_THRESHOLD

      if (!signMatches || magnitudeWeak) {
        const severity = !signMatches && Math.abs(r) > MAGNITUDE_THRESHOLD
          ? 'critical'
          : 'warning'

        let explanation: string
        if (!signMatches && Math.abs(r) > MAGNITUDE_THRESHOLD) {
          explanation = `Expected ${pair.expected} correlation between ${pair.a} and ${pair.b}, but observed ${r > 0 ? 'positive' : 'negative'} correlation (r=${r.toFixed(2)}). This reversal may indicate a decoupled or failing subsystem.`
        } else if (magnitudeWeak) {
          explanation = `Correlation between ${pair.a} and ${pair.b} has weakened significantly (r=${r.toFixed(2)}, expected ${pair.expected}). The sensors may no longer be responding to the same process variable.`
        } else {
          explanation = `Unexpected correlation pattern between ${pair.a} and ${pair.b} (r=${r.toFixed(2)}, expected ${pair.expected}).`
        }

        breaks.push({
          sensorA: pair.a,
          sensorB: pair.b,
          expected: pair.expected,
          actual: r,
          severity,
          explanation,
        })
      }
    }

    return breaks
  }
}
