/**
 * Mock implementation of IExperiments for testing.
 *
 * Allows tests to:
 * 1. Set specific variants for experiments
 * 2. Verify exposure tracking
 * 3. Test both control and treatment variants
 */

import type {
  IExperiments,
  ExperimentConfig,
  ExperimentResult,
  ExperimentVariant,
} from '@/lib/interfaces/IExperiments'

interface ExposureEvent {
  experimentKey: string
  variant: ExperimentVariant
  timestamp: Date
}

interface ConversionEvent {
  experimentKey: string
  eventName: string
  metadata?: Record<string, unknown>
  timestamp: Date
}

export class MockExperiments implements IExperiments {
  private variants: Map<string, ExperimentVariant> = new Map()
  private exposures: ExposureEvent[] = []
  private conversions: ConversionEvent[] = []
  private forcedVariants: Map<string, ExperimentVariant> = new Map()

  /**
   * Set the variant for a specific experiment.
   * Use this in beforeEach to configure test scenarios.
   */
  setVariant(experimentKey: string, variant: ExperimentVariant): void {
    this.variants.set(experimentKey, variant)
  }

  /**
   * Set multiple variants at once.
   */
  setVariants(variants: Record<string, ExperimentVariant>): void {
    Object.entries(variants).forEach(([key, variant]) => {
      this.variants.set(key, variant)
    })
  }

  getVariant<T extends ExperimentVariant>(config: ExperimentConfig): ExperimentResult<T> {
    // Check for forced variant first
    if (this.forcedVariants.has(config.key)) {
      const variant = this.forcedVariants.get(config.key) as T
      this.trackExposure(config.key, variant)
      return {
        variant,
        inExperiment: true,
        experimentKey: config.key,
      }
    }

    // Check for set variant
    if (this.variants.has(config.key)) {
      const variant = this.variants.get(config.key) as T
      this.trackExposure(config.key, variant)
      return {
        variant,
        inExperiment: true,
        experimentKey: config.key,
      }
    }

    // Return default
    return {
      variant: config.defaultValue as T,
      inExperiment: false,
      experimentKey: config.key,
    }
  }

  isEnabled(key: string, defaultValue: boolean = false): boolean {
    if (this.forcedVariants.has(key)) {
      return this.forcedVariants.get(key) as boolean
    }
    if (this.variants.has(key)) {
      return this.variants.get(key) as boolean
    }
    return defaultValue
  }

  trackExposure(experimentKey: string, variant: ExperimentVariant): void {
    this.exposures.push({
      experimentKey,
      variant,
      timestamp: new Date(),
    })
  }

  trackConversion(
    experimentKey: string,
    eventName: string,
    metadata?: Record<string, unknown>
  ): void {
    this.conversions.push({
      experimentKey,
      eventName,
      metadata,
      timestamp: new Date(),
    })
  }

  forceVariant(experimentKey: string, variant: ExperimentVariant): () => void {
    this.forcedVariants.set(experimentKey, variant)
    return () => {
      this.forcedVariants.delete(experimentKey)
    }
  }

  getActiveExperiments(): Record<string, ExperimentVariant> {
    const active: Record<string, ExperimentVariant> = {}
    this.variants.forEach((variant, key) => {
      active[key] = variant
    })
    this.forcedVariants.forEach((variant, key) => {
      active[key] = variant
    })
    return active
  }

  // ============ Test Helpers ============

  /**
   * Get all recorded exposures.
   */
  getExposures(): ExposureEvent[] {
    return [...this.exposures]
  }

  /**
   * Get exposures for a specific experiment.
   */
  getExposuresFor(experimentKey: string): ExposureEvent[] {
    return this.exposures.filter((e) => e.experimentKey === experimentKey)
  }

  /**
   * Check if an experiment was exposed.
   */
  wasExposed(experimentKey: string): boolean {
    return this.exposures.some((e) => e.experimentKey === experimentKey)
  }

  /**
   * Get all recorded conversions.
   */
  getConversions(): ConversionEvent[] {
    return [...this.conversions]
  }

  /**
   * Get conversions for a specific experiment.
   */
  getConversionsFor(experimentKey: string): ConversionEvent[] {
    return this.conversions.filter((c) => c.experimentKey === experimentKey)
  }

  /**
   * Check if a conversion was tracked.
   */
  hasConversion(experimentKey: string, eventName?: string): boolean {
    return this.conversions.some(
      (c) => c.experimentKey === experimentKey && (!eventName || c.eventName === eventName)
    )
  }

  /**
   * Reset all state (call in afterEach).
   */
  reset(): void {
    this.variants.clear()
    this.exposures = []
    this.conversions = []
    this.forcedVariants.clear()
  }
}
