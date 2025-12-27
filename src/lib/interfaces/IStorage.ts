/**
 * Storage interface for dependency injection.
 *
 * Abstracts localStorage/sessionStorage operations,
 * enabling in-memory mock implementations for testing.
 */

/**
 * Interface for key-value storage operations.
 *
 * Provides a consistent interface for localStorage, sessionStorage,
 * or any other key-value storage mechanism.
 */
export interface IStorage {
  /**
   * Get a value from storage.
   * @param key - The key to retrieve
   * @returns The stored value or null if not found
   */
  getItem(key: string): string | null

  /**
   * Set a value in storage.
   * @param key - The key to set
   * @param value - The value to store
   */
  setItem(key: string, value: string): void

  /**
   * Remove a value from storage.
   * @param key - The key to remove
   */
  removeItem(key: string): void

  /**
   * Clear all values from storage.
   */
  clear(): void

  /**
   * Get the number of items in storage.
   */
  readonly length: number

  /**
   * Get the key at a given index.
   * @param index - The index of the key
   * @returns The key at the index or null
   */
  key(index: number): string | null
}

/**
 * Factory for creating storage instances.
 *
 * Provides separate instances for localStorage and sessionStorage behaviors.
 */
export interface IStorageFactory {
  /**
   * Get the persistent storage instance (like localStorage).
   */
  local: IStorage

  /**
   * Get the session storage instance (like sessionStorage).
   */
  session: IStorage
}
