'use client'

import { useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { FollowUpChips } from './FollowUpChips'
import { ResponseCard } from './ResponseCard'
import { DisclaimerBanner } from './DisclaimerBanner'
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
  const lastAssistantRef = useRef<HTMLDivElement>(null)
  const streamingRef = useRef<HTMLDivElement>(null)

  // When a new assistant message appears, scroll to show it from the TOP
  const prevMessageCountRef = useRef(messages.length)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Check if this is a new message (count increased)
    if (messages.length > prevMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1]

      // If user just sent a message, scroll to bottom to see typing indicator
      if (lastMsg?.role === 'user') {
        container.scrollTop = container.scrollHeight
      }
    }

    prevMessageCountRef.current = messages.length
  }, [messages.length])

  // When assistant response appears (loading ends), scroll to show it from top
  const wasLoadingRef = useRef(false)
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && lastAssistantRef.current) {
      // Response just finished - scroll to show the assistant message from the top
      lastAssistantRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    wasLoadingRef.current = isLoading
  }, [isLoading])

  // Auto-scroll while streaming
  useEffect(() => {
    if (isStreaming && streamingContent && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      // Only auto-scroll if user is near the bottom
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [isStreaming, streamingContent])

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto"
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

          const isLastAssistant = message.role === 'assistant' && index === messages.length - 1

          return (
            <div
              key={`${message.timestamp}-${index}`}
              ref={isLastAssistant ? lastAssistantRef : undefined}
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
          <div ref={streamingRef}>
            <MessageBubble
              message={{
                role: 'assistant',
                content: streamingContent,
                timestamp: new Date().toISOString(),
              }}
              isLast={true}
              isStreaming={true}
            />
          </div>
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

        {/* Scroll anchor */}
        <div className="h-4" />
      </div>
      </div>
    </div>
  )
}
