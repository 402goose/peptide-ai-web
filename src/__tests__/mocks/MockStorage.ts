/**
 * Mock storage implementation for testing.
 *
 * Provides an in-memory implementation of localStorage/sessionStorage,
 * allowing tests to run without accessing browser storage APIs.
 */

import type { IStorage, IStorageFactory } from '@/lib/interfaces/IStorage'

/**
 * In-memory storage implementation.
 *
 * Mimics the Web Storage API (localStorage/sessionStorage) but stores
 * all data in memory for testing purposes.
 *
 * @example
 * ```ts
 * const storage = new MockStorage()
 * storage.setItem('key', 'value')
 * expect(storage.getItem('key')).toBe('value')
 * ```
 */
export class MockStorage implements IStorage {
  private data: Map<string, string> = new Map()

  get length(): number {
    return this.data.size
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  clear(): void {
    this.data.clear()
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys())
    return keys[index] ?? null
  }

  // Helper methods for testing

  /**
   * Get all stored keys.
   */
  getAllKeys(): string[] {
    return Array.from(this.data.keys())
  }

  /**
   * Get all stored data as an object.
   */
  getAllData(): Record<string, string> {
    return Object.fromEntries(this.data)
  }

  /**
   * Seed storage with initial data.
   */
  seed(data: Record<string, string>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.data.set(key, value)
    })
  }
}

/**
 * Mock storage factory for testing.
 *
 * Provides separate in-memory storage instances for local and session storage.
 *
 * @example
 * ```ts
 * const factory = new MockStorageFactory()
 * factory.local.setItem('persistent', 'value')
 * factory.session.setItem('temporary', 'value')
 * ```
 */
export class MockStorageFactory implements IStorageFactory {
  readonly local: MockStorage
  readonly session: MockStorage

  constructor() {
    this.local = new MockStorage()
    this.session = new MockStorage()
  }

  /**
   * Clear both local and session storage.
   */
  clearAll(): void {
    this.local.clear()
    this.session.clear()
  }

  /**
   * Reset factory with new storage instances.
   */
  reset(): void {
    this.local.clear()
    this.session.clear()
  }
}
