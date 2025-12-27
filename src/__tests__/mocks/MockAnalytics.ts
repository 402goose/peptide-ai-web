/**
 * Mock analytics implementation for testing.
 *
 * Provides a no-op implementation of analytics that records all
 * tracking calls for test assertions.
 */

import type {
  IAnalytics,
  TrackEventProperties,
  PageViewProperties,
  ChatEventProperties,
  SourceClickProperties,
} from '@/lib/interfaces/IAnalytics'

interface TrackedEvent {
  type: 'event' | 'pageView' | 'sessionStart' | 'chatSent' | 'sourceClicked' | 'signUp' | 'feedback'
  name?: string
  properties?: unknown
  timestamp: Date
}

/**
 * Mock analytics for unit testing.
 *
 * Records all tracking calls without making network requests.
 * Useful for verifying that analytics events are fired correctly.
 *
 * @example
 * ```ts
 * const analytics = new MockAnalytics()
 * analytics.trackEvent('button_click', { buttonId: 'submit' })
 *
 * expect(analytics.getEvents('event')).toHaveLength(1)
 * expect(analytics.getEvents('event')[0].name).toBe('button_click')
 * ```
 */
export class MockAnalytics implements IAnalytics {
  private events: TrackedEvent[] = []
  private sessionId: string = `mock-session-${Date.now()}`
  private isNew: boolean = true
  private hasChatted: boolean = false

  trackEvent(eventName: string, properties?: TrackEventProperties): void {
    this.events.push({
      type: 'event',
      name: eventName,
      properties,
      timestamp: new Date(),
    })
  }

  trackPageView(pageName: string, properties?: PageViewProperties): void {
    this.events.push({
      type: 'pageView',
      name: pageName,
      properties,
      timestamp: new Date(),
    })
  }

  trackSessionStart(): void {
    this.events.push({
      type: 'sessionStart',
      timestamp: new Date(),
    })
  }

  trackChatSent(properties: ChatEventProperties): void {
    this.events.push({
      type: 'chatSent',
      properties,
      timestamp: new Date(),
    })
  }

  trackSourceClicked(properties: SourceClickProperties): void {
    this.events.push({
      type: 'sourceClicked',
      properties,
      timestamp: new Date(),
    })
  }

  trackSignUp(method?: string): void {
    this.events.push({
      type: 'signUp',
      properties: { method },
      timestamp: new Date(),
    })
  }

  trackFeedbackSubmitted(properties?: TrackEventProperties): void {
    this.events.push({
      type: 'feedback',
      properties,
      timestamp: new Date(),
    })
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  isNewUser(): boolean {
    return this.isNew
  }

  hasUserChatted(): boolean {
    return this.hasChatted
  }

  markUserChatted(): void {
    this.hasChatted = true
  }

  // Helper methods for testing

  /**
   * Get all tracked events, optionally filtered by type.
   */
  getEvents(type?: TrackedEvent['type']): TrackedEvent[] {
    if (type) {
      return this.events.filter((e) => e.type === type)
    }
    return [...this.events]
  }

  /**
   * Get the most recent event of a given type.
   */
  getLastEvent(type?: TrackedEvent['type']): TrackedEvent | undefined {
    const events = this.getEvents(type)
    return events[events.length - 1]
  }

  /**
   * Check if an event with the given name was tracked.
   */
  hasTrackedEvent(eventName: string): boolean {
    return this.events.some((e) => e.name === eventName)
  }

  /**
   * Get count of events by type.
   */
  getEventCount(type?: TrackedEvent['type']): number {
    return this.getEvents(type).length
  }

  /**
   * Clear all tracked events.
   */
  clearEvents(): void {
    this.events = []
  }

  /**
   * Set whether this is a new user (for testing).
   */
  setIsNewUser(isNew: boolean): void {
    this.isNew = isNew
  }

  /**
   * Set whether user has chatted (for testing).
   */
  setHasChatted(hasChatted: boolean): void {
    this.hasChatted = hasChatted
  }

  /**
   * Set session ID (for testing).
   */
  setSessionId(id: string): void {
    this.sessionId = id
  }

  /**
   * Reset all state.
   */
  reset(): void {
    this.events = []
    this.sessionId = `mock-session-${Date.now()}`
    this.isNew = true
    this.hasChatted = false
  }
}
