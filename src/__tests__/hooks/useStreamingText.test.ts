/**
 * Tests for useStreamingText hook.
 *
 * Tests the text animation hook used for streaming chat responses.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStreamingText } from '@/hooks/useStreamingText'

describe('useStreamingText', () => {
  // Mock requestAnimationFrame and performance.now
  let rafId = 0
  let rafCallbacks: Map<number, FrameRequestCallback> = new Map()
  let currentTime = 0

  beforeEach(() => {
    rafId = 0
    rafCallbacks = new Map()
    currentTime = 0

    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = ++rafId
      rafCallbacks.set(id, callback)
      return id
    })

    // Mock cancelAnimationFrame
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id)
    })

    // Mock performance.now
    vi.stubGlobal('performance', {
      now: () => currentTime,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Helper to advance animation by running pending RAF callbacks
  const advanceAnimation = (times: number = 1, timePerFrame: number = 16) => {
    for (let i = 0; i < times; i++) {
      currentTime += timePerFrame
      const callbacks = Array.from(rafCallbacks.values())
      rafCallbacks.clear()
      callbacks.forEach((cb) => cb(currentTime))
    }
  }

  describe('Initial State', () => {
    it('should start with empty displayed text', () => {
      const { result } = renderHook(() => useStreamingText())

      expect(result.current.displayedText).toBe('')
    })

    it('should start not animating', () => {
      const { result } = renderHook(() => useStreamingText())

      expect(result.current.isAnimating).toBe(false)
    })

    it('should start not complete', () => {
      const { result } = renderHook(() => useStreamingText())

      expect(result.current.isComplete).toBe(false)
    })
  })

  describe('appendText', () => {
    it('should start animation when text is appended', () => {
      const { result } = renderHook(() => useStreamingText())

      act(() => {
        result.current.appendText('Hello')
      })

      expect(result.current.isAnimating).toBe(true)
    })

    it('should accumulate appended text', () => {
      const { result } = renderHook(() => useStreamingText())

      act(() => {
        result.current.appendText('Hello')
        result.current.appendText(' World')
      })

      // Skip animation to see full text
      act(() => {
        result.current.skipAnimation()
      })

      expect(result.current.displayedText).toBe('Hello World')
    })
  })

  describe('Animation', () => {
    it('should animate text character by character', async () => {
      const { result } = renderHook(() => useStreamingText({ charDelay: 15 }))

      act(() => {
        result.current.appendText('Hi')
      })

      // First frame - should display first character
      act(() => {
        advanceAnimation(1, 16)
      })

      expect(result.current.displayedText).toBe('H')

      // Second frame - should display second character
      act(() => {
        advanceAnimation(1, 16)
      })

      expect(result.current.displayedText).toBe('Hi')
    })

    it('should respect charDelay option', () => {
      const { result } = renderHook(() => useStreamingText({ charDelay: 50 }))

      act(() => {
        result.current.appendText('ABC')
      })

      // Advance 30ms - should only show first char
      act(() => {
        advanceAnimation(2, 30)
      })

      expect(result.current.displayedText.length).toBeLessThanOrEqual(2)
    })
  })

  describe('finishStreaming', () => {
    it('should complete when animation catches up after finish', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useStreamingText({ charDelay: 15, onComplete }))

      act(() => {
        result.current.appendText('Hi')
        result.current.finishStreaming()
      })

      // Animate through all characters
      act(() => {
        advanceAnimation(5, 20)
      })

      expect(result.current.isComplete).toBe(true)
      expect(onComplete).toHaveBeenCalled()
    })

    it('should not complete while still animating', () => {
      const { result } = renderHook(() => useStreamingText({ charDelay: 15 }))

      act(() => {
        result.current.appendText('Hello World!')
        result.current.finishStreaming()
      })

      // Only advance a little
      act(() => {
        advanceAnimation(2, 16)
      })

      expect(result.current.isComplete).toBe(false)
    })
  })

  describe('reset', () => {
    it('should clear all state', () => {
      const { result } = renderHook(() => useStreamingText())

      act(() => {
        result.current.appendText('Hello')
        advanceAnimation(3, 20)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.displayedText).toBe('')
      expect(result.current.isAnimating).toBe(false)
      expect(result.current.isComplete).toBe(false)
    })

    it('should allow starting new stream after reset', () => {
      const { result } = renderHook(() => useStreamingText())

      // First stream
      act(() => {
        result.current.appendText('First')
        result.current.skipAnimation()
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      // Second stream
      act(() => {
        result.current.appendText('Second')
        result.current.skipAnimation()
      })

      expect(result.current.displayedText).toBe('Second')
    })
  })

  describe('skipAnimation', () => {
    it('should show all text immediately', () => {
      const { result } = renderHook(() => useStreamingText())

      act(() => {
        result.current.appendText('Hello World!')
      })

      act(() => {
        result.current.skipAnimation()
      })

      expect(result.current.displayedText).toBe('Hello World!')
      expect(result.current.isAnimating).toBe(false)
    })

    it('should complete if streaming was finished', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useStreamingText({ onComplete }))

      act(() => {
        result.current.appendText('Test')
        result.current.finishStreaming()
        result.current.skipAnimation()
      })

      expect(result.current.isComplete).toBe(true)
      expect(onComplete).toHaveBeenCalled()
    })

    it('should not complete if streaming not finished', () => {
      const { result } = renderHook(() => useStreamingText())

      act(() => {
        result.current.appendText('Test')
        result.current.skipAnimation()
      })

      expect(result.current.isComplete).toBe(false)
    })
  })

  describe('onComplete callback', () => {
    it('should call onComplete when fully animated and streaming done', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useStreamingText({ charDelay: 10, onComplete }))

      act(() => {
        result.current.appendText('Hi')
        result.current.finishStreaming()
      })

      // Animate through all
      act(() => {
        advanceAnimation(10, 15)
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should not call onComplete if streaming not finished', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useStreamingText({ charDelay: 10, onComplete }))

      act(() => {
        result.current.appendText('Hi')
      })

      // Animate through all
      act(() => {
        advanceAnimation(10, 15)
      })

      // Still waiting for more text
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should cancel animation frame on unmount', () => {
      const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame')

      const { result, unmount } = renderHook(() => useStreamingText())

      act(() => {
        result.current.appendText('Hello')
      })

      unmount()

      expect(cancelSpy).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string append', () => {
      const { result } = renderHook(() => useStreamingText())

      act(() => {
        result.current.appendText('')
      })

      expect(result.current.displayedText).toBe('')
    })

    it('should handle rapid appends', () => {
      const { result } = renderHook(() => useStreamingText())

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.appendText('a')
        }
        result.current.skipAnimation()
      })

      expect(result.current.displayedText).toBe('a'.repeat(100))
    })

    it('should handle special characters', () => {
      const { result } = renderHook(() => useStreamingText())

      const specialText = '🎉 Hello! こんにちは\n\tNew Line'

      act(() => {
        result.current.appendText(specialText)
        result.current.skipAnimation()
      })

      expect(result.current.displayedText).toBe(specialText)
    })

    it('should handle markdown content', () => {
      const { result } = renderHook(() => useStreamingText())

      const markdown = '## Header\n\n**bold** and *italic*\n\n```code```'

      act(() => {
        result.current.appendText(markdown)
        result.current.skipAnimation()
      })

      expect(result.current.displayedText).toBe(markdown)
    })
  })
})
