/**
 * Tests for ServiceContext and dependency injection.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  ServiceProvider,
  useServices,
  useApi,
  useStorage,
  useAnalytics,
} from '@/lib/context/ServiceContext'
import { MockApiClient, MockStorageFactory, MockAnalytics } from '../mocks'

describe('ServiceContext', () => {
  let mockApi: MockApiClient
  let mockStorage: MockStorageFactory
  let mockAnalytics: MockAnalytics

  beforeEach(() => {
    mockApi = new MockApiClient()
    mockStorage = new MockStorageFactory()
    mockAnalytics = new MockAnalytics()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ServiceProvider
      services={{
        api: mockApi,
        storage: mockStorage,
        analytics: mockAnalytics,
      }}
    >
      {children}
    </ServiceProvider>
  )

  describe('ServiceProvider', () => {
    it('should provide services to children', () => {
      const TestComponent = () => {
        const services = useServices()
        return <div data-testid="has-services">{services ? 'yes' : 'no'}</div>
      }

      render(<TestComponent />, { wrapper })

      expect(screen.getByTestId('has-services').textContent).toBe('yes')
    })

    it('should throw when used outside provider', () => {
      const TestComponent = () => {
        useServices()
        return null
      }

      expect(() => render(<TestComponent />)).toThrow(
        'useServices must be used within a ServiceProvider'
      )
    })
  })

  describe('useApi', () => {
    it('should return the API client', () => {
      const { result } = renderHook(() => useApi(), { wrapper })

      expect(result.current).toBe(mockApi)
    })

    it('should allow calling API methods', async () => {
      const { result } = renderHook(() => useApi(), { wrapper })

      const response = await result.current.healthCheck()
      expect(response.status).toBe('healthy')
    })
  })

  describe('useStorage', () => {
    it('should return the storage factory', () => {
      const { result } = renderHook(() => useStorage(), { wrapper })

      expect(result.current).toBe(mockStorage)
    })

    it('should provide local storage', () => {
      const { result } = renderHook(() => useStorage(), { wrapper })

      result.current.local.setItem('test', 'value')
      expect(result.current.local.getItem('test')).toBe('value')
    })

    it('should provide session storage', () => {
      const { result } = renderHook(() => useStorage(), { wrapper })

      result.current.session.setItem('test', 'value')
      expect(result.current.session.getItem('test')).toBe('value')
    })
  })

  describe('useAnalytics', () => {
    it('should return the analytics instance', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper })

      expect(result.current).toBe(mockAnalytics)
    })

    it('should track events', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper })

      result.current.trackEvent('test_event', { key: 'value' })

      expect(mockAnalytics.hasTrackedEvent('test_event')).toBe(true)
    })

    it('should track page views', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper })

      result.current.trackPageView('/test-page')

      const events = mockAnalytics.getEvents('pageView')
      expect(events).toHaveLength(1)
      expect(events[0].name).toBe('/test-page')
    })
  })

  describe('MockStorage', () => {
    it('should clear all data', () => {
      mockStorage.local.setItem('key1', 'value1')
      mockStorage.session.setItem('key2', 'value2')

      mockStorage.clearAll()

      expect(mockStorage.local.getItem('key1')).toBeNull()
      expect(mockStorage.session.getItem('key2')).toBeNull()
    })

    it('should report length correctly', () => {
      mockStorage.local.setItem('key1', 'value1')
      mockStorage.local.setItem('key2', 'value2')

      expect(mockStorage.local.length).toBe(2)
    })

    it('should enumerate keys', () => {
      mockStorage.local.setItem('alpha', '1')
      mockStorage.local.setItem('beta', '2')

      expect(mockStorage.local.key(0)).toBeDefined()
      expect(mockStorage.local.key(2)).toBeNull()
    })
  })

  describe('MockAnalytics', () => {
    it('should track chat events', () => {
      mockAnalytics.trackChatSent({
        conversationId: 'conv-1',
        messageLength: 50,
        isFirstMessage: true,
      })

      const events = mockAnalytics.getEvents('chatSent')
      expect(events).toHaveLength(1)
      expect(events[0].properties).toEqual({
        conversationId: 'conv-1',
        messageLength: 50,
        isFirstMessage: true,
      })
    })

    it('should track source clicks', () => {
      mockAnalytics.trackSourceClicked({
        sourceType: 'pubmed',
        sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345',
      })

      const events = mockAnalytics.getEvents('sourceClicked')
      expect(events).toHaveLength(1)
    })

    it('should track user chatted state', () => {
      expect(mockAnalytics.hasUserChatted()).toBe(false)

      mockAnalytics.markUserChatted()

      expect(mockAnalytics.hasUserChatted()).toBe(true)
    })

    it('should reset state', () => {
      mockAnalytics.trackEvent('test')
      mockAnalytics.markUserChatted()

      mockAnalytics.reset()

      expect(mockAnalytics.getEvents()).toHaveLength(0)
      expect(mockAnalytics.hasUserChatted()).toBe(false)
    })
  })
})
