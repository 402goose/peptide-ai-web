/**
 * API Client interface for dependency injection.
 *
 * Defines the contract for API operations, enabling mock implementations
 * for testing without making real HTTP requests.
 */

import type {
  ChatRequest,
  ChatResponse,
  ConversationSummary,
  Conversation,
  StreamChunk,
} from '@/types'
import type {
  JourneySummary,
  JourneyDetail,
  CreateJourneyRequest,
  LogDoseRequest,
  LogSymptomsRequest,
} from '@/types/journey'
import type {
  HolisticProduct,
  Symptom,
  SymptomWithProducts,
  CategoryCount,
  SearchResult,
  AffiliateClickData,
} from '@/types/affiliate'

/**
 * Interface for the API client.
 *
 * All methods that make HTTP requests are defined here,
 * allowing for mock implementations in tests.
 */
export interface IApiClient {
  // API Key management
  setApiKey(key: string): void
  getApiKey(): string | null
  clearApiKey(): void

  // Chat endpoints
  sendMessage(request: ChatRequest): Promise<ChatResponse>
  streamMessage(
    request: ChatRequest,
    onChunk: (data: StreamChunk) => void
  ): Promise<void>

  // Conversation endpoints
  getConversations(limit?: number, offset?: number): Promise<ConversationSummary[]>
  getConversation(id: string): Promise<Conversation>
  deleteConversation(id: string): Promise<void>
  updateConversation(id: string, data: { title?: string }): Promise<void>
  deleteAllConversations(): Promise<{ deleted: number }>

  // Health check
  healthCheck(): Promise<{ status: string }>

  // Journey endpoints
  getJourneys(status?: string, limit?: number, offset?: number): Promise<JourneySummary[]>
  getJourney(id: string): Promise<JourneyDetail>
  createJourney(request: CreateJourneyRequest): Promise<{ journey_id: string; status: string }>
  startJourney(id: string, startDate?: string): Promise<{ journey_id: string; status: string }>
  pauseJourney(id: string, reason?: string): Promise<{ journey_id: string; status: string }>
  resumeJourney(id: string): Promise<{ journey_id: string; status: string }>
  completeJourney(
    id: string,
    data: {
      overall_efficacy_rating: number
      would_recommend: boolean
      would_use_again: boolean
      outcome_summary?: string
    }
  ): Promise<{ journey_id: string; status: string }>

  // Dose logging
  logDose(journeyId: string, data: LogDoseRequest): Promise<{ log_id: string }>

  // Symptom logging
  logSymptoms(journeyId: string, data: LogSymptomsRequest): Promise<{ log_id: string }>

  // Milestones and notes
  addMilestone(
    journeyId: string,
    data: { title: string; description?: string; milestone_date?: string }
  ): Promise<{ milestone_id: string }>
  addNote(
    journeyId: string,
    data: { note_type: string; content: string }
  ): Promise<{ note_id: string }>

  // Share functionality
  createShareLink(
    conversationId: string,
    options?: { expires_in_days?: number }
  ): Promise<{ share_id: string; share_url: string; expires_at?: string }>
  getSharedConversation(shareId: string): Promise<{
    share_id: string
    title: string
    messages: { role: string; content: string }[]
    created_at: string
    shared_at: string
  }>

  // Affiliate endpoints
  getSymptoms(
    category?: string,
    search?: string,
    limit?: number,
    offset?: number
  ): Promise<{ symptoms: Symptom[]; total: number }>
  getSymptomBySlug(slug: string): Promise<SymptomWithProducts>
  getSymptomCategories(): Promise<CategoryCount[]>
  getProducts(
    productType?: string,
    isPeptide?: boolean,
    search?: string,
    limit?: number,
    offset?: number
  ): Promise<{ products: HolisticProduct[]; total: number }>
  getProductById(productId: string): Promise<{
    product: HolisticProduct
    related_symptoms: Symptom[]
  }>
  searchSymptomsAndProducts(query: string, source?: string): Promise<SearchResult>
  trackAffiliateClick(data: AffiliateClickData): Promise<{
    click_id: string
    affiliate_url?: string
    product_name: string
  }>
}
