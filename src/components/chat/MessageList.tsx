'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { FollowUpChips } from './FollowUpChips'
import { ResponseCard } from './ResponseCard'
import { DisclaimerBanner } from './DisclaimerBanner'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message, Source } from '@/types'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  isStreaming?: boolean
  streamingContent?: string
  sources: Source[]
  disclaimers: string[]
  followUps: string[]
  onFollowUpClick: (question: string) => void
}

// Threshold for considering user "at bottom"
const SCROLL_THRESHOLD = 100

export function MessageList({
  messages,
  isLoading,
  isStreaming = false,
  streamingContent = '',
  sources,
  disclaimers,
  followUps,
  onFollowUpClick,
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomAnchorRef = useRef<HTMLDivElement>(null)

  // Track if user is at bottom (should auto-scroll)
  const [isAtBottom, setIsAtBottom] = useState(true)
  // Track if there's new content below (show indicator)
  const [hasNewContent, setHasNewContent] = useState(false)
  // Track if user manually scrolled (to prevent auto-scroll override)
  const userScrolledRef = useRef(false)
  const lastScrollTopRef = useRef(0)

  // Check if scrolled to bottom
  const checkIsAtBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return true
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    return distanceFromBottom < SCROLL_THRESHOLD
  }, [])

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((smooth = true) => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant'
    })
    setHasNewContent(false)
    setIsAtBottom(true)
  }, [])

  // Handle scroll events to track user intent
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop
      const atBottom = checkIsAtBottom()

      // Detect if user scrolled UP (intentionally reviewing history)
      if (currentScrollTop < lastScrollTopRef.current - 10) {
        userScrolledRef.current = true
      }

      // If user scrolled to bottom, reset the flag
      if (atBottom) {
        userScrolledRef.current = false
        setHasNewContent(false)
      }

      setIsAtBottom(atBottom)
      lastScrollTopRef.current = currentScrollTop
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [checkIsAtBottom])

  // When user sends a message, always scroll to bottom
  const prevMessageCountRef = useRef(messages.length)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1]

      // User just sent a message - scroll to bottom to see response
      if (lastMsg?.role === 'user') {
        userScrolledRef.current = false
        scrollToBottom(false) // Instant scroll for user messages
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length, scrollToBottom])

  // Auto-scroll during streaming (only if user hasn't scrolled up)
  useEffect(() => {
    if (!isStreaming || !streamingContent) return

    // If user scrolled up intentionally, don't auto-scroll but show indicator
    if (userScrolledRef.current) {
      setHasNewContent(true)
      return
    }

    // If at bottom, keep scrolling
    if (isAtBottom) {
      scrollToBottom(false) // Instant for smooth streaming feel
    }
  }, [isStreaming, streamingContent, isAtBottom, scrollToBottom])

  // When streaming ends, gentle scroll if user is near bottom
  const wasStreamingRef = useRef(false)
  useEffect(() => {
    if (wasStreamingRef.current && !isStreaming) {
      // Streaming just ended
      if (!userScrolledRef.current && isAtBottom) {
        // Small delay to let final content render
        setTimeout(() => scrollToBottom(true), 100)
      } else if (userScrolledRef.current) {
        setHasNewContent(true)
      }
    }
    wasStreamingRef.current = isStreaming
  }, [isStreaming, isAtBottom, scrollToBottom])

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto scroll-smooth"
    >
      {/* Min height ensures content starts at top, not pushed to bottom */}
      <div className="min-h-full flex flex-col justify-end">

      <div className="mx-auto max-w-3xl w-full px-4 py-6">
        {messages.map((message, index) => {
          // Skip empty assistant messages while loading (we'll show typing indicator instead)
          const isEmptyStreamingMessage = isLoading &&
            message.role === 'assistant' &&
            index === messages.length - 1 &&
            (!message.content || message.content.length === 0)

          if (isEmptyStreamingMessage) return null

          return (
            <div key={`${message.timestamp}-${index}`}>
              <MessageBubble
                message={message}
                isLast={index === messages.length - 1 && !isLoading}
                isStreaming={isStreaming && index === messages.length - 1}
              />
            </div>
          )
        })}

        {/* Show typing indicator only when waiting for first content */}
        {isLoading && !isStreaming && !streamingContent && <TypingIndicator />}

        {/* Show streaming content as it comes in */}
        {isStreaming && streamingContent && (
          <MessageBubble
            message={{
              role: 'assistant',
              content: streamingContent,
              timestamp: new Date().toISOString(),
            }}
            isLast={true}
            isStreaming={true}
          />
        )}

        {/* Show interactive elements after the last assistant message */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <div className="mt-4 space-y-3">
            {/* Sources Preview - Always visible teaser */}
            {sources.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50">
                <div className="flex -space-x-1">
                  {sources.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                      {i + 1}
                    </div>
                  ))}
                  {sources.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                      +{sources.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {sources.length} research sources found
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    Scroll down to explore ↓
                  </span>
                </div>
              </div>
            )}

            {/* Follow-up questions - More prominent */}
            {followUps.length > 0 && (
              <FollowUpChips followUps={followUps} onClick={onFollowUpClick} />
            )}

            {/* Disclaimer banner - compact */}
            {disclaimers.length > 0 && (
              <DisclaimerBanner disclaimers={disclaimers} />
            )}

            {/* Full tabbed response card with sources, experiences, protocol, vendors */}
            {sources.length > 0 && (
              <ResponseCard
                sources={sources}
                showVendors={true}
              />
            )}
          </div>
        )}

        {/* Bottom anchor for scroll detection */}
        <div ref={bottomAnchorRef} className="h-4" />
      </div>
      </div>

      {/* "New content" floating button - appears when user scrolls up */}
      {hasNewContent && (
        <button
          onClick={() => scrollToBottom(true)}
          className={cn(
            "absolute bottom-24 left-1/2 -translate-x-1/2 z-10",
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-blue-600 text-white shadow-lg",
            "hover:bg-blue-700 transition-all duration-200",
            "animate-bounce-subtle"
          )}
        >
          <ChevronDown className="h-4 w-4" />
          <span className="text-sm font-medium">New content</span>
        </button>
      )}
    </div>
  )
}
