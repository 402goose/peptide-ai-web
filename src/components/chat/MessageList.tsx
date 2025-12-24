'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
          <motion.div
            className="mt-4 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Follow-up suggestions - compact horizontal chips */}
            {followUps.length > 0 && (
              <FollowUpChips followUps={followUps} onClick={onFollowUpClick} />
            )}

            {/* Collapsible research card with sources */}
            {sources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <ResponseCard
                  sources={sources}
                  showVendors={true}
                />
              </motion.div>
            )}

            {/* Subtle disclaimer - just a text line */}
            {disclaimers.length > 0 && (
              <DisclaimerBanner disclaimers={disclaimers} />
            )}
          </motion.div>
        )}

        {/* Bottom anchor for scroll detection */}
        <div ref={bottomAnchorRef} className="h-4" />
      </div>
      </div>

      {/* "New content" floating button - appears when user scrolls up */}
      <AnimatePresence>
        {hasNewContent && (
          <motion.button
            onClick={() => scrollToBottom(true)}
            className={cn(
              "absolute bottom-24 left-1/2 -translate-x-1/2 z-10",
              "flex items-center gap-2 px-5 py-2.5 rounded-full",
              "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
              "shadow-lg shadow-blue-500/25",
              "hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105",
              "transition-all duration-200"
            )}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
            <span className="text-sm font-medium">New content</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
