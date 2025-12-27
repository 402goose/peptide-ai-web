'use client'

/**
 * Service Context for Dependency Injection.
 *
 * Provides injectable services throughout the React component tree.
 * In production, uses real implementations. In tests, uses mocks.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { IApiClient } from '@/lib/interfaces/IApiClient'
import type { IStorage, IStorageFactory } from '@/lib/interfaces/IStorage'
import type { IAnalytics } from '@/lib/interfaces/IAnalytics'
import { api } from '@/lib/api'

/**
 * Services available through dependency injection.
 */
export interface Services {
  api: IApiClient
  storage: IStorageFactory
  analytics: IAnalytics
}

/**
 * Context for accessing services.
 */
const ServiceContext = createContext<Services | null>(null)

/**
 * Browser Storage implementation.
 * Wraps localStorage and sessionStorage.
 */
class BrowserStorage implements IStorage {
  constructor(private storage: Storage) {}

  get length(): number {
    return this.storage.length
  }

  getItem(key: string): string | null {
    return this.storage.getItem(key)
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value)
  }

  removeItem(key: string): void {
    this.storage.removeItem(key)
  }

  clear(): void {
    this.storage.clear()
  }

  key(index: number): string | null {
    return this.storage.key(index)
  }
}

/**
 * Browser Storage Factory implementation.
 */
class BrowserStorageFactory implements IStorageFactory {
  readonly local: IStorage
  readonly session: IStorage

  constructor() {
    if (typeof window !== 'undefined') {
      this.local = new BrowserStorage(window.localStorage)
      this.session = new BrowserStorage(window.sessionStorage)
    } else {
      // SSR fallback - no-op storage
      const noopStorage: IStorage = {
        length: 0,
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
      }
      this.local = noopStorage
      this.session = noopStorage
    }
  }
}

/**
 * No-op Analytics implementation for production.
 * Replace with actual analytics provider (e.g., Mixpanel, Amplitude).
 */
class ProductionAnalytics implements IAnalytics {
  trackEvent(): void {}
  trackPageView(): void {}
  trackSessionStart(): void {}
  trackChatSent(): void {}
  trackSourceClicked(): void {}
  trackSignUp(): void {}
  trackFeedbackSubmitted(): void {}
  getSessionId(): string | null {
    return null
  }
  isNewUser(): boolean {
    return false
  }
  hasUserChatted(): boolean {
    return false
  }
  markUserChatted(): void {}
}

/**
 * Default services for production use.
 */
const defaultServices: Services = {
  api,
  storage: new BrowserStorageFactory(),
  analytics: new ProductionAnalytics(),
}

interface ServiceProviderProps {
  children: ReactNode
  services?: Partial<Services>
}

/**
 * Provider component for services.
 *
 * @example Production usage (in app layout):
 * ```tsx
 * <ServiceProvider>
 *   <App />
 * </ServiceProvider>
 * ```
 *
 * @example Test usage (with mocks):
 * ```tsx
 * const mockApi = new MockApiClient()
 * <ServiceProvider services={{ api: mockApi }}>
 *   <ComponentUnderTest />
 * </ServiceProvider>
 * ```
 */
export function ServiceProvider({ children, services }: ServiceProviderProps) {
  const value = useMemo(
    () => ({
      ...defaultServices,
      ...services,
    }),
    [services]
  )

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  )
}

/**
 * Hook to access all services.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { api, storage, analytics } = useServices()
 *   // Use services...
 * }
 * ```
 */
export function useServices(): Services {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider')
  }
  return context
}

/**
 * Hook to access just the API client.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const api = useApi()
 *   const data = await api.getConversations()
 * }
 * ```
 */
export function useApi(): IApiClient {
  const { api } = useServices()
  return api
}

/**
 * Hook to access storage services.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const storage = useStorage()
 *   storage.local.setItem('key', 'value')
 * }
 * ```
 */
export function useStorage(): IStorageFactory {
  const { storage } = useServices()
  return storage
}

/**
 * Hook to access analytics.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const analytics = useAnalytics()
 *   analytics.trackEvent('button_click', { buttonId: 'submit' })
 * }
 * ```
 */
export function useAnalytics(): IAnalytics {
  const { analytics } = useServices()
  return analytics
}
