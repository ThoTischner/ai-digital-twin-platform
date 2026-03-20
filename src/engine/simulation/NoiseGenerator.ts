/**
 * NoiseGenerator — hash-based smooth noise with fractal layering.
 * Seeded permutation table for deterministic, reproducible results.
 * All output values are in the [-1, 1] range.
 */
export class NoiseGenerator {
  private perm: Uint8Array

  constructor(seed = 42) {
    this.perm = new Uint8Array(512)
    const base = new Uint8Array(256)
    for (let i = 0; i < 256; i++) base[i] = i

    // Fisher-Yates shuffle seeded with a simple LCG
    let s = seed
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      const j = ((s >>> 0) % (i + 1))
      const tmp = base[i]
      base[i] = base[j]
      base[j] = tmp
    }

    // Double the table so we can index without wrapping
    for (let i = 0; i < 512; i++) {
      this.perm[i] = base[i & 255]
    }
  }

  /**
   * Simple 1D hash-based smooth noise.
   * Uses cosine interpolation between two hashed lattice points.
   * Returns a value in [-1, 1].
   */
  noise1D(x: number): number {
    const xi = Math.floor(x)
    const frac = x - xi

    const a = this.hash(xi)
    const b = this.hash(xi + 1)

    // Cosine interpolation for smoothness
    const t = (1 - Math.cos(frac * Math.PI)) * 0.5
    const value = a + (b - a) * t

    return value
  }

  /**
   * Fractal (fBm) noise — layers multiple octaves of noise1D
   * for richer, more natural-looking variation.
   * Returns a value in approximately [-1, 1].
   */
  fractalNoise(t: number, octaves = 4, persistence = 0.5): number {
    let total = 0
    let frequency = 1
    let amplitude = 1
    let maxAmplitude = 0

    for (let i = 0; i < octaves; i++) {
      total += this.noise1D(t * frequency) * amplitude
      maxAmplitude += amplitude
      amplitude *= persistence
      frequency *= 2
    }

    // Normalize to [-1, 1]
    return total / maxAmplitude
  }

  /**
   * Hash a single integer through the permutation table
   * and map to [-1, 1].
   */
  private hash(n: number): number {
    const i = ((n % 256) + 256) & 255
    return (this.perm[i] / 255) * 2 - 1
  }
}
