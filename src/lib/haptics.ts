/**
 * Haptic feedback utility for PWA interactions
 * Uses the Vibration API with fallback for unsupported devices
 */

// Haptic patterns (duration in milliseconds)
export const HapticPatterns = {
  // Light tap for button presses, selections
  light: [10],
  // Medium tap for confirmations
  medium: [20],
  // Success feedback - double tap
  success: [10, 50, 10],
  // Warning/attention - longer pulse
  warning: [30, 50, 30],
  // Error - triple short
  error: [15, 30, 15, 30, 15],
  // Selection change
  selection: [5],
  // Impact for important actions
  impact: [25],
} as const

export type HapticPattern = keyof typeof HapticPatterns

/**
 * Check if haptic feedback is supported
 */
export function isHapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * Trigger haptic feedback
 * @param pattern - The haptic pattern to use
 * @returns true if haptic was triggered, false if not supported
 */
export function haptic(pattern: HapticPattern = 'light'): boolean {
  if (!isHapticsSupported()) {
    return false
  }

  try {
    const vibrationPattern = HapticPatterns[pattern]
    navigator.vibrate(vibrationPattern)
    return true
  } catch (e) {
    // Silently fail - haptics are a nice-to-have
    return false
  }
}

/**
 * Trigger a custom haptic pattern
 * @param pattern - Array of durations in ms [vibrate, pause, vibrate, ...]
 */
export function hapticCustom(pattern: number[]): boolean {
  if (!isHapticsSupported()) {
    return false
  }

  try {
    navigator.vibrate(pattern)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Cancel any ongoing haptic feedback
 */
export function hapticCancel(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(0)
  }
}

/**
 * React hook-friendly wrapper that returns haptic functions
 * Only triggers on touch devices to avoid desktop vibration attempts
 */
export function createHapticHandler(pattern: HapticPattern = 'light') {
  return () => {
    // Only trigger on touch-capable devices
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      haptic(pattern)
    }
  }
}
