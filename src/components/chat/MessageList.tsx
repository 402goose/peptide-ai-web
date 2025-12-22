'use client'

import { useRef, useEffect, useCallback } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { FollowUpChips } from './FollowUpChips'
import { ResponseCard } from './ResponseCard'
import { DisclaimerBanner } from './DisclaimerBanner'
import type { Message, Source } from '@/types'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  sources: Source[]
  disclaimers: string[]
  followUps: string[]
  onFollowUpClick: (question: string) => void
}

export function MessageList({
  messages,
  isLoading,
  sources,
  disclaimers,
  followUps,
  onFollowUpClick,
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)

  // Check if we're actively streaming (loading + last message is assistant with content)
  const lastMessage = messages[messages.length - 1]
  const isStreaming = isLoading && lastMessage?.role === 'assistant' && lastMessage?.content?.length > 0

  // Check if user is at the bottom (within threshold)
  const isAtBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return true
    const threshold = 50
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  // Scroll to bottom - only when appropriate
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [])

  // Track user scrolling - set flag when user scrolls away from bottom
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const atBottom = isAtBottom()

    // If user is at bottom, they want to follow new content
    // If they've scrolled up, don't auto-scroll
    isUserScrollingRef.current = !atBottom
  }, [isAtBottom])

  // Only auto-scroll when content changes AND user hasn't scrolled away
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }, [messages, scrollToBottom])

  // Force scroll when user sends a NEW message (reset scroll lock)
  const prevMessageCountRef = useRef(messages.length)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    const isNewUserMessage = messages.length > prevMessageCountRef.current && lastMsg?.role === 'user'

    if (isNewUserMessage) {
      isUserScrollingRef.current = false
      scrollToBottom()
    }

    prevMessageCountRef.current = messages.length
  }, [messages, scrollToBottom])

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto scroll-smooth flex flex-col"
    >
      {/* Spacer pushes content to bottom when there's not enough to fill screen */}
      <div className="flex-1" />

      <div className="mx-auto max-w-3xl w-full px-4 py-6">
        {messages.map((message, index) => {
          // Skip empty assistant messages while loading (we'll show typing indicator instead)
          const isEmptyStreamingMessage = isLoading &&
            message.role === 'assistant' &&
            index === messages.length - 1 &&
            (!message.content || message.content.length === 0)

          if (isEmptyStreamingMessage) return null

          return (
            <MessageBubble
              key={`${message.timestamp}-${index}`}
              message={message}
              isLast={index === messages.length - 1 && !isLoading}
              isStreaming={isStreaming && index === messages.length - 1}
            />
          )
        })}

        {/* Show typing indicator only when waiting for first content */}
        {isLoading && !isStreaming && <TypingIndicator />}

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

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  )
}
