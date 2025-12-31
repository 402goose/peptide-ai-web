/**
 * Tests demonstrating A/B testing patterns.
 *
 * Shows how to:
 * 1. Test both variants of an experiment
 * 2. Verify exposure tracking
 * 3. Test conversion tracking
 * 4. Test components with experiments
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { MockExperiments } from '../mocks/MockExperiments'
import { EXPERIMENTS } from '@/lib/interfaces/IExperiments'

describe('MockExperiments', () => {
  let experiments: MockExperiments

  beforeEach(() => {
    experiments = new MockExperiments()
  })

  describe('getVariant', () => {
    it('should return default value when experiment not set', () => {
      const result = experiments.getVariant(EXPERIMENTS.NEW_ONBOARDING)

      expect(result.variant).toBe(false)
      expect(result.inExperiment).toBe(false)
    })

    it('should return set variant', () => {
      experiments.setVariant('new_onboarding_flow', true)

      const result = experiments.getVariant(EXPERIMENTS.NEW_ONBOARDING)

      expect(result.variant).toBe(true)
      expect(result.inExperiment).toBe(true)
    })

    it('should track exposure when variant is retrieved', () => {
      experiments.setVariant('new_onboarding_flow', true)

      experiments.getVariant(EXPERIMENTS.NEW_ONBOARDING)

      expect(experiments.wasExposed('new_onboarding_flow')).toBe(true)
    })
  })

  describe('isEnabled', () => {
    it('should return default when flag not set', () => {
      expect(experiments.isEnabled('unknown_flag')).toBe(false)
      expect(experiments.isEnabled('unknown_flag', true)).toBe(true)
    })

    it('should return set value', () => {
      experiments.setVariant('my_feature', true)

      expect(experiments.isEnabled('my_feature')).toBe(true)
    })
  })

  describe('forceVariant', () => {
    it('should override set variant', () => {
      experiments.setVariant('test_experiment', 'control')

      const cleanup = experiments.forceVariant('test_experiment', 'treatment')

      const result = experiments.getVariant({
        key: 'test_experiment',
        defaultValue: 'control',
      })

      expect(result.variant).toBe('treatment')

      // Cleanup restores original
      cleanup()

      const afterCleanup = experiments.getVariant({
        key: 'test_experiment',
        defaultValue: 'control',
      })

      expect(afterCleanup.variant).toBe('control')
    })
  })

  describe('Conversion Tracking', () => {
    it('should track conversions', () => {
      experiments.trackConversion('signup_flow', 'completed_signup', {
        source: 'google',
      })

      expect(experiments.hasConversion('signup_flow', 'completed_signup')).toBe(true)

      const conversions = experiments.getConversionsFor('signup_flow')
      expect(conversions[0].metadata).toEqual({ source: 'google' })
    })
  })
})

describe('A/B Testing Patterns', () => {
  let experiments: MockExperiments

  beforeEach(() => {
    experiments = new MockExperiments()
  })

  describe('Testing Both Variants', () => {
    // Example: Testing a feature that behaves differently based on variant

    function getWelcomeMessage(experiments: MockExperiments): string {
      const { variant } = experiments.getVariant(EXPERIMENTS.NEW_ONBOARDING)

      if (variant) {
        return "Let's get you started with a personalized journey!"
      }
      return 'Welcome to Sequence'
    }

    it('should show standard message for control', () => {
      experiments.setVariant('new_onboarding_flow', false)

      const message = getWelcomeMessage(experiments)

      expect(message).toBe('Welcome to Sequence')
    })

    it('should show personalized message for treatment', () => {
      experiments.setVariant('new_onboarding_flow', true)

      const message = getWelcomeMessage(experiments)

      expect(message).toBe("Let's get you started with a personalized journey!")
    })
  })

  describe('Testing Multi-Variant Experiments', () => {
    function getChatLayout(experiments: MockExperiments): string {
      const { variant } = experiments.getVariant(EXPERIMENTS.CHAT_UI_VARIANT)

      switch (variant) {
        case 'compact':
          return 'compact-layout'
        case 'expanded':
          return 'expanded-layout'
        default:
          return 'default-layout'
      }
    }

    it('should use default layout for control', () => {
      experiments.setVariant('chat_ui_variant', 'control')

      expect(getChatLayout(experiments)).toBe('default-layout')
    })

    it('should use compact layout for compact variant', () => {
      experiments.setVariant('chat_ui_variant', 'compact')

      expect(getChatLayout(experiments)).toBe('compact-layout')
    })

    it('should use expanded layout for expanded variant', () => {
      experiments.setVariant('chat_ui_variant', 'expanded')

      expect(getChatLayout(experiments)).toBe('expanded-layout')
    })
  })

  describe('Verifying Experiment Exposure', () => {
    it('should track that user was exposed to experiment', () => {
      experiments.setVariant('new_onboarding_flow', true)

      // Simulate component rendering that checks experiment
      experiments.getVariant(EXPERIMENTS.NEW_ONBOARDING)

      // Verify exposure was tracked
      expect(experiments.wasExposed('new_onboarding_flow')).toBe(true)

      const exposures = experiments.getExposuresFor('new_onboarding_flow')
      expect(exposures).toHaveLength(1)
      expect(exposures[0].variant).toBe(true)
    })
  })

  describe('Testing Conversion Funnels', () => {
    it('should track full funnel for experiment', () => {
      experiments.setVariant('new_onboarding_flow', true)

      // User sees the experiment
      experiments.getVariant(EXPERIMENTS.NEW_ONBOARDING)

      // User completes onboarding
      experiments.trackConversion('new_onboarding_flow', 'completed_onboarding')

      // User sends first message
      experiments.trackConversion('new_onboarding_flow', 'first_message_sent')

      // Verify funnel
      const conversions = experiments.getConversionsFor('new_onboarding_flow')
      expect(conversions).toHaveLength(2)
      expect(conversions.map((c) => c.eventName)).toEqual([
        'completed_onboarding',
        'first_message_sent',
      ])
    })
  })

  describe('Feature Flags', () => {
    it('should gate features behind flags', () => {
      function canUseJourneys(experiments: MockExperiments): boolean {
        return experiments.isEnabled('journeys_feature', false)
      }

      // Flag off
      expect(canUseJourneys(experiments)).toBe(false)

      // Flag on
      experiments.setVariant('journeys_feature', true)
      expect(canUseJourneys(experiments)).toBe(true)
    })
  })
})
