'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useStreamingText } from '@/hooks/useStreamingText'
import { cn } from '@/lib/utils'

interface StreamingTextProps {
  /**
   * Whether streaming is active (tokens are still coming)
   */
  isStreaming: boolean

  /**
   * Called when animation is complete
   */
  onComplete?: () => void

  /**
   * Additional class names
   */
  className?: string

  /**
   * Show a blinking cursor at the end
   */
  showCursor?: boolean

  /**
   * Character delay in ms (lower = faster)
   */
  charDelay?: number
}

export interface StreamingTextHandle {
  appendText: (text: string) => void
  getDisplayedText: () => string
  reset: () => void
  skipAnimation: () => void
  isComplete: () => boolean
}

export const StreamingText = forwardRef<StreamingTextHandle, StreamingTextProps>(
  function StreamingText(
    {
      isStreaming,
      onComplete,
      className,
      showCursor = true,
      charDelay = 15, // Slightly faster default for chat
    },
    ref
  ) {
    const {
      displayedText,
      isAnimating,
      isComplete,
      appendText,
      finishStreaming,
      reset,
      skipAnimation,
    } = useStreamingText({
      charDelay,
      onComplete,
    })

    // Track previous streaming state to detect when it stops
    const wasStreamingRef = useRef(isStreaming)
    useEffect(() => {
      if (wasStreamingRef.current && !isStreaming) {
        // Streaming just stopped - mark it done
        finishStreaming()
      }
      wasStreamingRef.current = isStreaming
    }, [isStreaming, finishStreaming])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      appendText,
      getDisplayedText: () => displayedText,
      reset,
      skipAnimation,
      isComplete: () => isComplete,
    }), [appendText, displayedText, reset, skipAnimation, isComplete])

    // Render the text with proper whitespace handling
    const renderText = () => {
      if (!displayedText) return null

      // Split by newlines to preserve line breaks
      const lines = displayedText.split('\n')

      return lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))
    }

    return (
      <span className={cn('whitespace-pre-wrap', className)}>
        {renderText()}
        {showCursor && (isStreaming || isAnimating) && (
          <span
            className="inline-block w-0.5 h-[1.1em] ml-0.5 bg-current animate-pulse align-middle"
            aria-hidden="true"
          />
        )}
      </span>
    )
  }
)
