/**
 * Test setup file for vitest.
 *
 * This file runs before all tests and sets up the testing environment.
 */

import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock localStorage and sessionStorage
const mockStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}

Object.defineProperty(window, 'localStorage', {
  value: mockStorage(),
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage(),
  writable: true,
})

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock crypto.randomUUID for generating IDs
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${Math.random().toString(36).substring(7)}`,
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
  },
})

// Suppress console errors during tests (optional, comment out for debugging)
// const originalConsoleError = console.error
// beforeAll(() => {
//   console.error = vi.fn()
// })
// afterAll(() => {
//   console.error = originalConsoleError
// })

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})
