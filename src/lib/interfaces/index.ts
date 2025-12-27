/**
 * Interface definitions for dependency injection and testing.
 *
 * These interfaces define the contracts that services must implement,
 * enabling mock implementations for unit testing without network calls.
 */

export type { IApiClient } from './IApiClient'
export type { IStorage } from './IStorage'
export type { IAnalytics } from './IAnalytics'
export type { IExperiments, ExperimentConfig, ExperimentResult, ExperimentVariant } from './IExperiments'
export { EXPERIMENTS } from './IExperiments'
