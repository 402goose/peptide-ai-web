/**
 * Analytics tracking utility for Peptide AI
 *
 * Tracks user events to populate the admin dashboard metrics.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Event types matching the backend
export const EventType = {
  // Acquisition
  PAGE_VIEW: 'page_view',
  SIGN_UP_START: 'sign_up_start',
  SIGN_UP_COMPLETE: 'sign_up_complete',
  // Activation
  FIRST_CHAT: 'first_chat',
  FIRST_SOURCE_VIEW: 'first_source_view',
  // Engagement
  CHAT_SENT: 'chat_sent',
  SOURCE_CLICKED: 'source_clicked',
  SESSION_START: 'session_start',
  // Retention
  RETURN_VISIT: 'return_visit',
  // Feedback
  FEEDBACK_SUBMITTED: 'feedback_submitted',
} as const;

type EventTypeValue = typeof EventType[keyof typeof EventType];

interface TrackEventParams {
  eventType: EventTypeValue;
  properties?: Record<string, unknown>;
  sessionId?: string;
}

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('peptide_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('peptide_session_id', sessionId);
  }
  return sessionId;
}

// Check if this is a return visit
function checkReturnVisit(): boolean {
  if (typeof window === 'undefined') return false;

  const lastVisit = localStorage.getItem('peptide_last_visit');
  const now = Date.now();

  // Update last visit
  localStorage.setItem('peptide_last_visit', now.toString());

  if (lastVisit) {
    const hoursSinceLastVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
    // Consider it a return visit if more than 1 hour since last visit
    return hoursSinceLastVisit > 1;
  }

  return false;
}

// Track if user has sent their first chat
function isFirstChat(): boolean {
  if (typeof window === 'undefined') return false;

  const hasChattedBefore = localStorage.getItem('peptide_has_chatted');
  if (!hasChattedBefore) {
    localStorage.setItem('peptide_has_chatted', 'true');
    return true;
  }
  return false;
}

// Track if user has viewed their first source
function isFirstSourceView(): boolean {
  if (typeof window === 'undefined') return false;

  const hasViewedSource = localStorage.getItem('peptide_has_viewed_source');
  if (!hasViewedSource) {
    localStorage.setItem('peptide_has_viewed_source', 'true');
    return true;
  }
  return false;
}

/**
 * Track an analytics event
 */
export async function trackEvent({ eventType, properties = {}, sessionId }: TrackEventParams): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/v1/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        event_type: eventType,
        properties,
        session_id: sessionId || getSessionId(),
      }),
    });

    if (!response.ok) {
      console.warn('Analytics tracking failed:', response.status);
    }
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.warn('Analytics tracking error:', error);
  }
}

/**
 * Track a page view
 */
export function trackPageView(page: string): void {
  const isReturn = checkReturnVisit();

  // Track page view
  trackEvent({
    eventType: EventType.PAGE_VIEW,
    properties: { page },
  });

  // Track return visit if applicable
  if (isReturn) {
    trackEvent({
      eventType: EventType.RETURN_VISIT,
      properties: { page },
    });
  }
}

/**
 * Track session start
 */
export function trackSessionStart(): void {
  trackEvent({
    eventType: EventType.SESSION_START,
    properties: {
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  });
}

/**
 * Track a chat message sent
 */
export function trackChatSent(properties: {
  conversationId?: string;
  messageLength: number;
  peptideMentioned?: string;
}): void {
  // Check if this is the first chat
  const firstChat = isFirstChat();

  if (firstChat) {
    trackEvent({
      eventType: EventType.FIRST_CHAT,
      properties,
    });
  }

  trackEvent({
    eventType: EventType.CHAT_SENT,
    properties: {
      ...properties,
      is_first_chat: firstChat,
    },
  });
}

/**
 * Track when a source/citation is clicked
 */
export function trackSourceClicked(properties: {
  sourceType: string;
  sourceUrl?: string;
  sourceTitle?: string;
  peptide?: string;
}): void {
  const firstSource = isFirstSourceView();

  if (firstSource) {
    trackEvent({
      eventType: EventType.FIRST_SOURCE_VIEW,
      properties,
    });
  }

  trackEvent({
    eventType: EventType.SOURCE_CLICKED,
    properties: {
      ...properties,
      is_first_source: firstSource,
    },
  });
}

/**
 * Track sign up events
 */
export function trackSignUp(stage: 'start' | 'complete'): void {
  trackEvent({
    eventType: stage === 'start' ? EventType.SIGN_UP_START : EventType.SIGN_UP_COMPLETE,
  });
}

/**
 * Track feedback submission
 */
export function trackFeedbackSubmitted(properties: {
  feedbackType?: string;
  rating?: number;
}): void {
  trackEvent({
    eventType: EventType.FEEDBACK_SUBMITTED,
    properties,
  });
}
