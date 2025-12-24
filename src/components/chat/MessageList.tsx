'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { FollowUpChips } from './FollowUpChips'
import { ResponseCard } from './ResponseCard'
import { DisclaimerBanner } from './DisclaimerBanner'
import { ArrowDown } from 'lucide-react'
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
const SCROLL_THRESHOLD = 150

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
  const lastUserMessageRef = useRef<HTMLDivElement>(null)

  // Track if user is at bottom
  const [isAtBottom, setIsAtBottom] = useState(true)
  // Track if user manually scrolled up
  const userScrolledUpRef = useRef(false)
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
    setIsAtBottom(true)
    userScrolledUpRef.current = false
  }, [])

  // Scroll to show user message (not all the way to bottom)
  const scrollToUserMessage = useCallback(() => {
    if (lastUserMessageRef.current) {
      lastUserMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Handle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop
      const atBottom = checkIsAtBottom()

      // Detect if user scrolled UP
      if (currentScrollTop < lastScrollTopRef.current - 20) {
        userScrolledUpRef.current = true
      }

      // If user scrolled to bottom, reset flag
      if (atBottom) {
        userScrolledUpRef.current = false
      }

      setIsAtBottom(atBottom)
      lastScrollTopRef.current = currentScrollTop
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [checkIsAtBottom])

  // When user sends a message, scroll to show their message (start of response area)
  const prevMessageCountRef = useRef(messages.length)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1]

      // User just sent a message - scroll to show it
      if (lastMsg?.role === 'user') {
        userScrolledUpRef.current = false
        // Small delay to let the message render
        setTimeout(() => scrollToUserMessage(), 50)
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length, scrollToUserMessage])

  // During streaming - don't auto-scroll, let user control
  // The arrow will show automatically when not at bottom
  // User can tap arrow to scroll to bottom if they want

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden scroll-smooth"
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

          const isLastUserMessage = message.role === 'user' &&
            (index === messages.length - 1 || messages[index + 1]?.role === 'assistant')

          return (
            <div
              key={`${message.timestamp}-${index}`}
              ref={isLastUserMessage ? lastUserMessageRef : undefined}
            >
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

      {/* Scroll to bottom arrow - ChatGPT style */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            onClick={() => scrollToBottom(true)}
            className={cn(
              "absolute bottom-4 right-4 z-10",
              "flex items-center justify-center",
              "h-10 w-10 rounded-full",
              "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
              "shadow-md",
              "hover:bg-slate-300 dark:hover:bg-slate-600",
              "transition-all duration-200"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
