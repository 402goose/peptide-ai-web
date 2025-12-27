/**
 * Interface for A/B testing and feature flags.
 *
 * This abstraction allows:
 * 1. Swapping implementations (LaunchDarkly, Statsig, custom, etc.)
 * 2. Mocking in tests to verify both variants
 * 3. Forcing variants for E2E testing
 */

export type ExperimentVariant = string | boolean | number | null

export interface ExperimentConfig {
  /** Unique experiment identifier */
  key: string
  /** Default value if experiment not found or user not bucketed */
  defaultValue: ExperimentVariant
  /** Optional: experiment description for documentation */
  description?: string
}

export interface ExperimentResult<T extends ExperimentVariant = ExperimentVariant> {
  /** The variant the user is assigned to */
  variant: T
  /** Whether the user is in the experiment */
  inExperiment: boolean
  /** Experiment key for reference */
  experimentKey: string
}

export interface IExperiments {
  /**
   * Get the variant for a specific experiment.
   * Returns the variant the current user is assigned to.
   */
  getVariant<T extends ExperimentVariant>(config: ExperimentConfig): ExperimentResult<T>

  /**
   * Check if a feature flag is enabled.
   * Convenience method for boolean experiments.
   */
  isEnabled(key: string, defaultValue?: boolean): boolean

  /**
   * Track an experiment exposure (for analytics).
   * Called automatically when getVariant is used.
   */
  trackExposure(experimentKey: string, variant: ExperimentVariant): void

  /**
   * Track a conversion event for an experiment.
   */
  trackConversion(experimentKey: string, eventName: string, metadata?: Record<string, unknown>): void

  /**
   * Force a specific variant (for testing/debugging).
   * Returns a cleanup function to restore original behavior.
   */
  forceVariant(experimentKey: string, variant: ExperimentVariant): () => void

  /**
   * Get all active experiments for the current user.
   */
  getActiveExperiments(): Record<string, ExperimentVariant>
}

/**
 * Known experiments in the application.
 * Define experiments here for type safety and documentation.
 */
export const EXPERIMENTS = {
  // Example: New onboarding flow
  NEW_ONBOARDING: {
    key: 'new_onboarding_flow',
    defaultValue: false,
    description: 'Test new guided onboarding experience',
  },

  // Example: Chat UI variant
  CHAT_UI_VARIANT: {
    key: 'chat_ui_variant',
    defaultValue: 'control',
    description: 'A/B test for chat interface layout',
  },

  // Example: Response mode default
  DEFAULT_RESPONSE_MODE: {
    key: 'default_response_mode',
    defaultValue: 'balanced',
    description: 'Test different default response modes',
  },
} as const satisfies Record<string, ExperimentConfig>
