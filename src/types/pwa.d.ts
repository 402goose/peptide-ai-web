/**
 * PWA API Type Definitions
 * Extends Navigator interface with PWA-specific APIs
 */

interface Navigator {
  /** Set the app badge count (Badging API) */
  setAppBadge(count?: number): Promise<void>
  /** Clear the app badge (Badging API) */
  clearAppBadge(): Promise<void>
  /** iOS Safari standalone mode detection */
  standalone?: boolean
}
