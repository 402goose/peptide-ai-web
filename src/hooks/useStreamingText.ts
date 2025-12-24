'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseStreamingTextOptions {
  /**
   * Milliseconds between each character render
   * Lower = faster typing, Higher = slower typing
   * Default: 20ms (~50 chars/second, feels natural)
   */
  charDelay?: number

  /**
   * How many characters to batch before updating React state
   * Higher = better performance, Lower = smoother appearance
   * Default: 3
   */
  batchSize?: number

  /**
   * Callback when streaming completes
   */
  onComplete?: () => void
}

interface UseStreamingTextReturn {
  /**
   * The currently displayed text (animated)
   */
  displayedText: string

  /**
   * The full text received so far (may be ahead of displayedText)
   */
  fullText: string

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
  const {
    charDelay = 20,
    batchSize = 3,
    onComplete,
  } = options

  // Full text buffer (all tokens received)
  const [fullText, setFullText] = useState('')

  // Currently displayed text (animated portion)
  const [displayedText, setDisplayedText] = useState('')

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false)
  const [streamingDone, setStreamingDone] = useState(false)

  // Refs for animation loop
  const animationFrameRef = useRef<number | null>(null)
  const lastCharTimeRef = useRef<number>(0)
  const charIndexRef = useRef<number>(0)
  const charBatchRef = useRef<string>('')

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Animation loop using requestAnimationFrame
  const animate = useCallback((timestamp: number) => {
    const fullTextCurrent = fullText
    const currentIndex = charIndexRef.current

    // Check if we've caught up to the full text
    if (currentIndex >= fullTextCurrent.length) {
      // If streaming is done and we've displayed everything, we're complete
      if (streamingDone) {
        setIsAnimating(false)
        onComplete?.()
        return
      }
      // Otherwise, keep waiting for more text
      animationFrameRef.current = requestAnimationFrame(animate)
      return
    }

    // Check if enough time has passed since last character
    if (timestamp - lastCharTimeRef.current >= charDelay) {
      // Add next character to batch
      charBatchRef.current += fullTextCurrent[currentIndex]
      charIndexRef.current++
      lastCharTimeRef.current = timestamp

      // Update React state every batchSize characters or if we hit a space/newline
      const lastChar = fullTextCurrent[currentIndex]
      const shouldFlush =
        charBatchRef.current.length >= batchSize ||
        lastChar === ' ' ||
        lastChar === '\n' ||
        currentIndex >= fullTextCurrent.length - 1

      if (shouldFlush && charBatchRef.current.length > 0) {
        setDisplayedText(prev => prev + charBatchRef.current)
        charBatchRef.current = ''
      }
    }

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [fullText, streamingDone, charDelay, batchSize, onComplete])

  // Start/restart animation when fullText changes
  useEffect(() => {
    if (fullText.length > 0 && !isAnimating) {
      setIsAnimating(true)
      lastCharTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [fullText, isAnimating, animate])

  // Restart animation loop when animate callback changes
  useEffect(() => {
    if (isAnimating && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [animate, isAnimating])

  const appendText = useCallback((text: string) => {
    setFullText(prev => prev + text)
  }, [])

  const finishStreaming = useCallback(() => {
    setStreamingDone(true)
  }, [])

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setFullText('')
    setDisplayedText('')
    setIsAnimating(false)
    setStreamingDone(false)
    charIndexRef.current = 0
    charBatchRef.current = ''
    lastCharTimeRef.current = 0
  }, [])

  const skipAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setDisplayedText(fullText)
    charIndexRef.current = fullText.length
    charBatchRef.current = ''
    setIsAnimating(false)
    if (streamingDone) {
      onComplete?.()
    }
  }, [fullText, streamingDone, onComplete])

  const isComplete = streamingDone && !isAnimating && displayedText === fullText

  return {
    displayedText,
    fullText,
    isAnimating,
    isComplete,
    appendText,
    finishStreaming,
    reset,
    skipAnimation,
  }
}
