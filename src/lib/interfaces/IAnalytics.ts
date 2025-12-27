/**
 * Analytics interface for dependency injection.
 *
 * Abstracts analytics/tracking operations,
 * enabling no-op mock implementations for testing.
 */

/**
 * Properties for tracking events.
 */
export interface TrackEventProperties {
  [key: string]: string | number | boolean | undefined
}

/**
 * Properties for tracking page views.
 */
export interface PageViewProperties {
  referrer?: string
  url?: string
  title?: string
}

/**
 * Properties for tracking chat events.
 */
export interface ChatEventProperties {
  conversationId?: string
  messageLength?: number
  peptideMentioned?: string
  isFirstMessage?: boolean
}

/**
 * Properties for tracking source clicks.
 */
export interface SourceClickProperties {
  sourceType: string
  sourceUrl?: string
  peptideMentioned?: string
}

/**
 * Interface for analytics operations.
 *
 * Provides methods for tracking user events, page views,
 * and other analytics data.
 */
export interface IAnalytics {
  /**
   * Track a generic event.
   * @param eventName - The name of the event
   * @param properties - Optional event properties
   */
  trackEvent(eventName: string, properties?: TrackEventProperties): void

  /**
   * Track a page view.
   * @param pageName - The name/path of the page
   * @param properties - Optional page view properties
   */
  trackPageView(pageName: string, properties?: PageViewProperties): void

  /**
   * Track session start.
   */
  trackSessionStart(): void

  /**
   * Track a chat message sent.
   * @param properties - Chat event properties
   */
  trackChatSent(properties: ChatEventProperties): void

  /**
   * Track a source/citation click.
   * @param properties - Source click properties
   */
  trackSourceClicked(properties: SourceClickProperties): void

  /**
   * Track user sign up.
   * @param method - The sign up method (e.g., 'google', 'email')
   */
  trackSignUp(method?: string): void

  /**
   * Track feedback submission.
   * @param properties - Feedback properties
   */
  trackFeedbackSubmitted(properties?: TrackEventProperties): void

  /**
   * Get the current session ID.
   */
  getSessionId(): string | null

  /**
   * Check if this is a new user (first visit).
   */
  isNewUser(): boolean

  /**
   * Check if user has chatted before.
   */
  hasUserChatted(): boolean

  /**
   * Mark that user has chatted.
   */
  markUserChatted(): void
}
