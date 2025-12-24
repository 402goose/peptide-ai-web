'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseStreamingTextOptions {
  /**
   * Milliseconds between each character render
   * Lower = faster typing, Higher = slower typing
   * Default: 15ms (~67 chars/second)
   */
  charDelay?: number

  /**
   * Callback when all text has been displayed
   */
  onComplete?: () => void
}

interface UseStreamingTextReturn {
  /**
   * The currently displayed text (animated)
   */
  displayedText: string

  /**
   * Whether we're still animating characters
   */
  isAnimating: boolean

  /**
   * Whether streaming is complete (all tokens received AND animated)
   */
  isComplete: boolean

  /**
   * Add new text to the buffer (call this when tokens arrive)
   */
  appendText: (text: string) => void

  /**
   * Mark streaming as complete (no more tokens coming)
   */
  finishStreaming: () => void

  /**
   * Reset state for a new stream
   */
  reset: () => void

  /**
   * Skip animation and show all text immediately
   */
  skipAnimation: () => void
}

export function useStreamingText(options: UseStreamingTextOptions = {}): UseStreamingTextReturn {
  const { charDelay = 15, onComplete } = options

  // Use ref for the full text to avoid closure issues in animation loop
  const fullTextRef = useRef('')

  // Currently displayed text (React state for rendering)
  const [displayedText, setDisplayedText] = useState('')

  // Current character index in the animation
  const charIndexRef = useRef(0)

  // Animation state
  const isAnimatingRef = useRef(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Stream state
  const streamingDoneRef = useRef(false)
  const [isComplete, setIsComplete] = useState(false)

  // Animation frame ref
  const animationFrameRef = useRef<number | null>(null)
  const lastCharTimeRef = useRef(0)

  // The animation loop - uses refs to always get current values
  const runAnimation = useCallback(() => {
    const now = performance.now()
    const fullText = fullTextRef.current
    const currentIndex = charIndexRef.current

    // If we've displayed all available text
    if (currentIndex >= fullText.length) {
      // If streaming is done, we're complete
      if (streamingDoneRef.current) {
        isAnimatingRef.current = false
        setIsAnimating(false)
        setIsComplete(true)
        onComplete?.()
        return
      }
      // Otherwise keep waiting for more text
      animationFrameRef.current = requestAnimationFrame(runAnimation)
      return
    }

    // Check if enough time passed for next character
    if (now - lastCharTimeRef.current >= charDelay) {
      // Advance by one character
      charIndexRef.current++
      lastCharTimeRef.current = now

      // Update displayed text from the ref (single source of truth)
      setDisplayedText(fullText.slice(0, charIndexRef.current))
    }

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(runAnimation)
  }, [charDelay, onComplete])

  // Start animation if not already running
  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true
      setIsAnimating(true)
      lastCharTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(runAnimation)
    }
  }, [runAnimation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const appendText = useCallback((text: string) => {
    // Append to the ref (source of truth)
    fullTextRef.current += text
    // Start animation if not running
    startAnimation()
  }, [startAnimation])

  const finishStreaming = useCallback(() => {
    streamingDoneRef.current = true
  }, [])

  const reset = useCallback(() => {
    // Cancel any running animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    // Reset all state
    fullTextRef.current = ''
    charIndexRef.current = 0
    lastCharTimeRef.current = 0
    isAnimatingRef.current = false
    streamingDoneRef.current = false
    setDisplayedText('')
    setIsAnimating(false)
    setIsComplete(false)
  }, [])

  const skipAnimation = useCallback(() => {
    // Cancel animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    // Show all text immediately
    const fullText = fullTextRef.current
    charIndexRef.current = fullText.length
    setDisplayedText(fullText)
    isAnimatingRef.current = false
    setIsAnimating(false)
    if (streamingDoneRef.current) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [onComplete])

  return {
    displayedText,
    isAnimating,
    isComplete,
    appendText,
    finishStreaming,
    reset,
    skipAnimation,
  }
}
