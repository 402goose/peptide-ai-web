/**
 * App Badging API utilities
 * Shows a badge count on the app icon (iOS 16.4+, Chrome, Edge)
 */

/**
 * Set the app badge count on the home screen icon
 * @param count - Number to display (0 clears the badge)
 */
export async function setAppBadge(count: number): Promise<boolean> {
  if (!('setAppBadge' in navigator)) {
    return false
  }

  try {
    if (count > 0) {
      await navigator.setAppBadge(count)
    } else {
      await navigator.clearAppBadge()
    }
    return true
  } catch (error) {
    // Silently fail - badge API may not be available in current context
    console.debug('[Badge] Could not set badge:', error)
    return false
  }
}

/**
 * Clear the app badge
 */
export async function clearAppBadge(): Promise<boolean> {
  return setAppBadge(0)
}

/**
 * Check if the Badging API is supported
 */
export function isBadgingSupported(): boolean {
  return 'setAppBadge' in navigator
}
