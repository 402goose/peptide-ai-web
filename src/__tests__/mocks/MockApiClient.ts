/**
 * Mock API client for testing.
 *
 * Provides an in-memory implementation of the API client,
 * allowing tests to run without making real HTTP requests.
 */

import type { IApiClient } from '@/lib/interfaces/IApiClient'
import type {
  ChatRequest,
  ChatResponse,
  ConversationSummary,
  Conversation,
  StreamChunk,
  Message,
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

interface CallRecord {
  method: string
  args: unknown[]
  timestamp: Date
}

/**
 * Mock API client for unit testing.
 *
 * All methods store call history for assertions and return
 * configurable mock data.
 *
 * @example
 * ```ts
 * const mockApi = new MockApiClient()
 * mockApi.setMockConversations([{ id: '1', title: 'Test' }])
 *
 * const conversations = await mockApi.getConversations()
 * expect(conversations).toHaveLength(1)
 * expect(mockApi.getCallHistory('getConversations')).toHaveLength(1)
 * ```
 */
export class MockApiClient implements IApiClient {
  private apiKey: string | null = null
  private callHistory: CallRecord[] = []

  // Mock data stores
  private conversations: Map<string, Conversation> = new Map()
  private journeys: Map<string, JourneyDetail> = new Map()
  private symptoms: Symptom[] = []
  private products: HolisticProduct[] = []

  // Configurable responses
  private chatResponse: ChatResponse = {
    conversation_id: 'mock-conv-id',
    message: 'This is a mock response',
    sources: [],
    disclaimers: [],
    follow_up_questions: [],
    metadata: { model: 'mock', context_chunks: 0, elapsed_ms: 100 },
  }

  private streamChunks: StreamChunk[] = [
    { type: 'conversation_id', conversation_id: 'mock-conv-id' },
    { type: 'content', content: 'Mock streaming ' },
    { type: 'content', content: 'response content.' },
    { type: 'done', disclaimers: ['Mock disclaimer'] },
  ]

  // Record a method call
  private recordCall(method: string, args: unknown[]): void {
    this.callHistory.push({ method, args, timestamp: new Date() })
  }

  // Get call history for a specific method
  getCallHistory(method?: string): CallRecord[] {
    if (method) {
      return this.callHistory.filter((c) => c.method === method)
    }
    return this.callHistory
  }

  // Clear call history
  clearCallHistory(): void {
    this.callHistory = []
  }

  // Configure mock data
  setMockChatResponse(response: ChatResponse): void {
    this.chatResponse = response
  }

  setMockStreamChunks(chunks: StreamChunk[]): void {
    this.streamChunks = chunks
  }

  setMockConversations(conversations: Conversation[]): void {
    this.conversations.clear()
    conversations.forEach((c) => this.conversations.set(c.conversation_id, c))
  }

  setMockJourneys(journeys: JourneyDetail[]): void {
    this.journeys.clear()
    journeys.forEach((j) => this.journeys.set(j.journey_id, j))
  }

  setMockSymptoms(symptoms: Symptom[]): void {
    this.symptoms = symptoms
  }

  setMockProducts(products: HolisticProduct[]): void {
    this.products = products
  }

  // API Key management
  setApiKey(key: string): void {
    this.recordCall('setApiKey', [key])
    this.apiKey = key
  }

  getApiKey(): string | null {
    this.recordCall('getApiKey', [])
    return this.apiKey
  }

  clearApiKey(): void {
    this.recordCall('clearApiKey', [])
    this.apiKey = null
  }

  // Chat endpoints
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    this.recordCall('sendMessage', [request])
    return { ...this.chatResponse }
  }

  async streamMessage(
    request: ChatRequest,
    onChunk: (data: StreamChunk) => void
  ): Promise<void> {
    this.recordCall('streamMessage', [request])

    // Simulate streaming with small delays
    for (const chunk of this.streamChunks) {
      await new Promise((resolve) => setTimeout(resolve, 10))
      onChunk(chunk)
    }
  }

  // Conversation endpoints
  async getConversations(
    limit = 20,
    offset = 0
  ): Promise<ConversationSummary[]> {
    this.recordCall('getConversations', [limit, offset])

    const all = Array.from(this.conversations.values())
    return all.slice(offset, offset + limit).map((c) => ({
      conversation_id: c.conversation_id,
      title: c.title || 'Untitled',
      preview: c.messages?.[0]?.content?.slice(0, 100) || '',
      message_count: c.messages?.length || 0,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString(),
    }))
  }

  async getConversation(id: string): Promise<Conversation> {
    this.recordCall('getConversation', [id])

    const conversation = this.conversations.get(id)
    if (!conversation) {
      throw new Error(`Conversation ${id} not found`)
    }
    return conversation
  }

  async deleteConversation(id: string): Promise<void> {
    this.recordCall('deleteConversation', [id])
    this.conversations.delete(id)
  }

  async updateConversation(
    id: string,
    data: { title?: string }
  ): Promise<void> {
    this.recordCall('updateConversation', [id, data])

    const conversation = this.conversations.get(id)
    if (conversation && data.title) {
      conversation.title = data.title
    }
  }

  async deleteAllConversations(): Promise<{ deleted: number }> {
    this.recordCall('deleteAllConversations', [])
    const count = this.conversations.size
    this.conversations.clear()
    return { deleted: count }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    this.recordCall('healthCheck', [])
    return { status: 'healthy' }
  }

  // Journey endpoints
  async getJourneys(
    status?: string,
    limit = 20,
    offset = 0
  ): Promise<JourneySummary[]> {
    this.recordCall('getJourneys', [status, limit, offset])

    let journeys = Array.from(this.journeys.values())
    if (status) {
      journeys = journeys.filter((j) => j.status === status)
    }
    return journeys.slice(offset, offset + limit).map((j) => ({
      journey_id: j.journey_id,
      title: j.title,
      primary_peptide: j.primary_peptide,
      status: j.status,
      start_date: j.start_date,
      dose_count: j.dose_count || 0,
      created_at: j.created_at,
    }))
  }

  async getJourney(id: string): Promise<JourneyDetail> {
    this.recordCall('getJourney', [id])

    const journey = this.journeys.get(id)
    if (!journey) {
      throw new Error(`Journey ${id} not found`)
    }
    return journey
  }

  async createJourney(
    request: CreateJourneyRequest
  ): Promise<{ journey_id: string; status: string }> {
    this.recordCall('createJourney', [request])

    const id = `mock-journey-${Date.now()}`
    return { journey_id: id, status: 'planning' }
  }

  async startJourney(
    id: string,
    startDate?: string
  ): Promise<{ journey_id: string; status: string }> {
    this.recordCall('startJourney', [id, startDate])
    return { journey_id: id, status: 'active' }
  }

  async pauseJourney(
    id: string,
    reason?: string
  ): Promise<{ journey_id: string; status: string }> {
    this.recordCall('pauseJourney', [id, reason])
    return { journey_id: id, status: 'paused' }
  }

  async resumeJourney(id: string): Promise<{ journey_id: string; status: string }> {
    this.recordCall('resumeJourney', [id])
    return { journey_id: id, status: 'active' }
  }

  async completeJourney(
    id: string,
    data: {
      overall_efficacy_rating: number
      would_recommend: boolean
      would_use_again: boolean
      outcome_summary?: string
    }
  ): Promise<{ journey_id: string; status: string }> {
    this.recordCall('completeJourney', [id, data])
    return { journey_id: id, status: 'completed' }
  }

  // Dose logging
  async logDose(
    journeyId: string,
    data: LogDoseRequest
  ): Promise<{ log_id: string }> {
    this.recordCall('logDose', [journeyId, data])
    return { log_id: `mock-dose-${Date.now()}` }
  }

  // Symptom logging
  async logSymptoms(
    journeyId: string,
    data: LogSymptomsRequest
  ): Promise<{ log_id: string }> {
    this.recordCall('logSymptoms', [journeyId, data])
    return { log_id: `mock-symptom-${Date.now()}` }
  }

  // Milestones and notes
  async addMilestone(
    journeyId: string,
    data: { title: string; description?: string; milestone_date?: string }
  ): Promise<{ milestone_id: string }> {
    this.recordCall('addMilestone', [journeyId, data])
    return { milestone_id: `mock-milestone-${Date.now()}` }
  }

  async addNote(
    journeyId: string,
    data: { note_type: string; content: string }
  ): Promise<{ note_id: string }> {
    this.recordCall('addNote', [journeyId, data])
    return { note_id: `mock-note-${Date.now()}` }
  }

  // Share functionality
  async createShareLink(
    conversationId: string,
    options?: { expires_in_days?: number }
  ): Promise<{ share_id: string; share_url: string; expires_at?: string }> {
    this.recordCall('createShareLink', [conversationId, options])
    return {
      share_id: 'mock-share-id',
      share_url: 'https://example.com/share/mock-share-id',
    }
  }

  async getSharedConversation(shareId: string): Promise<{
    share_id: string
    title: string
    messages: { role: string; content: string }[]
    created_at: string
    shared_at: string
  }> {
    this.recordCall('getSharedConversation', [shareId])

    // Return first conversation or create a mock one
    const first = this.conversations.values().next().value
    if (first) {
      return {
        share_id: shareId,
        title: first.title || 'Shared Conversation',
        messages: first.messages || [],
        created_at: first.created_at || new Date().toISOString(),
        shared_at: new Date().toISOString(),
      }
    }

    return {
      share_id: shareId,
      title: 'Shared Conversation',
      messages: [],
      created_at: new Date().toISOString(),
      shared_at: new Date().toISOString(),
    }
  }

  // Affiliate endpoints
  async getSymptoms(
    category?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<{ symptoms: Symptom[]; total: number }> {
    this.recordCall('getSymptoms', [category, search, limit, offset])

    let filtered = this.symptoms
    if (category) {
      filtered = filtered.filter((s) => s.category === category)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchLower)
      )
    }

    return {
      symptoms: filtered.slice(offset, offset + limit),
      total: filtered.length,
    }
  }

  async getSymptomBySlug(slug: string): Promise<SymptomWithProducts> {
    this.recordCall('getSymptomBySlug', [slug])

    const symptom = this.symptoms.find((s) => s.slug === slug)
    if (!symptom) {
      throw new Error(`Symptom ${slug} not found`)
    }

    return {
      ...symptom,
      products: [],
      labs: [],
    }
  }

  async getSymptomCategories(): Promise<CategoryCount[]> {
    this.recordCall('getSymptomCategories', [])

    const counts = new Map<string, number>()
    this.symptoms.forEach((s) => {
      counts.set(s.category, (counts.get(s.category) || 0) + 1)
    })

    return Array.from(counts.entries()).map(([category, count]) => ({
      category: category as any,
      count,
    }))
  }

  async getProducts(
    productType?: string,
    isPeptide?: boolean,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<{ products: HolisticProduct[]; total: number }> {
    this.recordCall('getProducts', [productType, isPeptide, search, limit, offset])

    let filtered = this.products
    if (productType) {
      filtered = filtered.filter((p) => p.product_type === productType)
    }
    if (isPeptide !== undefined) {
      filtered = filtered.filter((p) => p.is_peptide === isPeptide)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchLower)
      )
    }

    return {
      products: filtered.slice(offset, offset + limit),
      total: filtered.length,
    }
  }

  async getProductById(productId: string): Promise<{
    product: HolisticProduct
    related_symptoms: Symptom[]
  }> {
    this.recordCall('getProductById', [productId])

    const product = this.products.find((p) => p.product_id === productId)
    if (!product) {
      throw new Error(`Product ${productId} not found`)
    }

    return {
      product,
      related_symptoms: [],
    }
  }

  async searchSymptomsAndProducts(
    query: string,
    source = 'search'
  ): Promise<SearchResult> {
    this.recordCall('searchSymptomsAndProducts', [query, source])

    const queryLower = query.toLowerCase()

    return {
      query,
      symptoms: this.symptoms.filter((s) =>
        s.name.toLowerCase().includes(queryLower)
      ),
      products: this.products.filter((p) =>
        p.name.toLowerCase().includes(queryLower)
      ),
    }
  }

  async trackAffiliateClick(data: AffiliateClickData): Promise<{
    click_id: string
    affiliate_url?: string
    product_name: string
  }> {
    this.recordCall('trackAffiliateClick', [data])

    return {
      click_id: `mock-click-${Date.now()}`,
      product_name: 'Mock Product',
    }
  }

  // Helper methods for tests
  reset(): void {
    this.apiKey = null
    this.callHistory = []
    this.conversations.clear()
    this.journeys.clear()
    this.symptoms = []
    this.products = []
  }
}
