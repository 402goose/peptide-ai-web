'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { StreamingText, StreamingTextHandle } from './StreamingText'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Source } from '@/types'

interface StreamingMessageProps {
  /**
   * Content to display (accumulated tokens)
   */
  content: string

  /**
   * Whether we're still receiving tokens
   */
  isStreaming: boolean

  /**
   * Sources for citation badges (used after streaming completes)
   */
  sources?: Source[]

  /**
   * Class name for the container
   */
  className?: string
}

/**
 * StreamingMessage handles the transition from:
 * 1. Animated plain text (during streaming) → smooth, no layout shifts
 * 2. Rendered markdown (after complete) → rich formatting with citations
 *
 * This prevents the jarring re-renders that happen when markdown is
 * re-parsed on every token.
 */
export function StreamingMessage({
  content,
  isStreaming,
  sources = [],
  className,
}: StreamingMessageProps) {
  const streamingRef = useRef<StreamingTextHandle>(null)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const prevContentRef = useRef('')

  // Feed new content to the streaming text component
  useEffect(() => {
    if (streamingRef.current && content !== prevContentRef.current) {
      // Calculate the new portion of text
      const newText = content.slice(prevContentRef.current.length)
      if (newText) {
        streamingRef.current.appendText(newText)
      }
      prevContentRef.current = content
    }
  }, [content])

  // Reset when content is cleared (new message)
  useEffect(() => {
    if (content === '' && streamingRef.current) {
      streamingRef.current.reset()
      prevContentRef.current = ''
      setShowMarkdown(false)
    }
  }, [content])

  // Handle animation complete - switch to markdown
  const handleComplete = useCallback(() => {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setShowMarkdown(true)
    }, 50)
  }, [])

  // If streaming is done and animation is complete, show markdown
  // Otherwise show animated streaming text
  if (showMarkdown && !isStreaming) {
    return (
      <div className={className}>
        <MarkdownRenderer content={content} sources={sources} />
      </div>
    )
  }

  return (
    <div className={className}>
      <StreamingText
        ref={streamingRef}
        isStreaming={isStreaming}
        onComplete={handleComplete}
        showCursor={true}
        charDelay={12} // Fast but smooth
      />
    </div>
  )
}
