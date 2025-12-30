import type { ChatRequest, ChatResponse, ConversationSummary, Conversation, StreamChunk } from '@/types'
import type {
  JourneySummary,
  JourneyDetail,
  CreateJourneyRequest,
  LogDoseRequest,
  LogSymptomsRequest,
} from '@/types/journey'
import type {
  HolisticProduct,
  LabTest,
  Symptom,
  SymptomWithProducts,
  CategoryCount,
  SearchResult,
  AffiliateClickData,
} from '@/types/affiliate'
import type { IApiClient } from '@/lib/interfaces/IApiClient'

// API_BASE: Set NEXT_PUBLIC_API_URL in production, otherwise API features are disabled
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Default API key for development - should be set via env in production
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-key-change-me'

class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`API Error: ${status}`)
    this.name = 'ApiError'
  }
}

class ApiClient implements IApiClient {
  private apiKey: string | null = null

  constructor() {
    // Load from localStorage on client side, fallback to default
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('peptide_api_key') || DEFAULT_API_KEY
    } else {
      this.apiKey = DEFAULT_API_KEY
    }
  }

  setApiKey(key: string) {
    this.apiKey = key
    if (typeof window !== 'undefined') {
      localStorage.setItem('peptide_api_key', key)
    }
  }

  getApiKey(): string | null {
    return this.apiKey
  }

  clearApiKey() {
    this.apiKey = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('peptide_api_key')
    }
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Skip API calls if no backend is configured
    if (!API_BASE) {
      console.log('[API] No backend configured, skipping:', endpoint)
      throw new ApiError(503, { error: 'Backend not configured' })
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.apiKey) {
      (headers as Record<string, string>)['X-API-Key'] = this.apiKey
    }

    const url = `${API_BASE}${endpoint}`
    console.log('[API] Fetching:', url, 'with key:', this.apiKey ? 'set' : 'missing')

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        console.error('[API] Error response:', response.status, data)
        throw new ApiError(response.status, data)
      }

      return response.json()
    } catch (error) {
      console.error('[API] Fetch failed:', error)
      throw error
    }
  }

  // Chat endpoints
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.fetch<ChatResponse>('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Streaming chat
  async streamMessage(
    request: ChatRequest,
    onChunk: (data: StreamChunk) => void
  ): Promise<void> {
    if (!API_BASE) {
      throw new ApiError(503, { error: 'Backend not configured' })
    }

    const url = `${API_BASE}/api/v1/chat/stream`
    console.log('[API] Streaming:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey || '',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader available')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            onChunk(data)
          } catch (e) {
            console.error('Failed to parse SSE data:', line)
          }
        }
      }
    }
  }

  // Conversation methods use local Next.js API routes for proper user isolation
  async getConversations(limit = 20, offset = 0): Promise<ConversationSummary[]> {
    const response = await fetch(`/api/conversations?limit=${limit}&offset=${offset}`)
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
    return response.json()
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`/api/conversations/${id}`)
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
    return response.json()
  }

  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
  }

  async updateConversation(id: string, data: { title?: string }): Promise<void> {
    const response = await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
  }

  async deleteAllConversations(): Promise<{ deleted: number }> {
    return this.fetch<{ deleted: number }>(`/api/v1/chat/conversations`, {
      method: 'DELETE',
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.fetch<{ status: string }>('/health')
  }

  // Journey endpoints
  async getJourneys(status?: string, limit = 20, offset = 0): Promise<JourneySummary[]> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (status) params.set('status', status)
    return this.fetch<JourneySummary[]>(`/api/v1/journeys?${params}`)
  }

  async getJourney(id: string): Promise<JourneyDetail> {
    return this.fetch<JourneyDetail>(`/api/v1/journeys/${id}`)
  }

  async createJourney(request: CreateJourneyRequest): Promise<{ journey_id: string; status: string }> {
    return this.fetch<{ journey_id: string; status: string }>('/api/v1/journeys', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async startJourney(id: string, startDate?: string): Promise<{ journey_id: string; status: string }> {
    return this.fetch<{ journey_id: string; status: string }>(`/api/v1/journeys/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ start_date: startDate }),
    })
  }

  async pauseJourney(id: string, reason?: string): Promise<{ journey_id: string; status: string }> {
    return this.fetch<{ journey_id: string; status: string }>(`/api/v1/journeys/${id}/pause?reason=${reason || ''}`, {
      method: 'POST',
    })
  }

  async resumeJourney(id: string): Promise<{ journey_id: string; status: string }> {
    return this.fetch<{ journey_id: string; status: string }>(`/api/v1/journeys/${id}/resume`, {
      method: 'POST',
    })
  }

  async completeJourney(
    id: string,
    data: {
      overall_efficacy_rating: number
      would_recommend: boolean
      would_use_again: boolean
      outcome_summary?: string
      what_worked?: string
      what_didnt_work?: string
      advice_for_others?: string
    }
  ): Promise<{ journey_id: string; status: string }> {
    return this.fetch<{ journey_id: string; status: string }>(`/api/v1/journeys/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logDose(journeyId: string, request: LogDoseRequest): Promise<{ log_id: string; timestamp: string }> {
    return this.fetch<{ log_id: string; timestamp: string }>(`/api/v1/journeys/${journeyId}/doses`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getJourneyDoseLogs(journeyId: string): Promise<unknown[]> {
    return this.fetch<unknown[]>(`/api/v1/journeys/${journeyId}/doses`)
  }

  async logSymptoms(journeyId: string, request: LogSymptomsRequest): Promise<{ log_id: string; log_date: string }> {
    return this.fetch<{ log_id: string; log_date: string }>(`/api/v1/journeys/${journeyId}/symptoms`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getJourneySymptomLogs(journeyId: string): Promise<unknown[]> {
    return this.fetch<unknown[]>(`/api/v1/journeys/${journeyId}/symptoms`)
  }

  async addMilestone(
    journeyId: string,
    data: {
      milestone_type: string
      title: string
      description: string
      related_goal_id?: string
      is_shareable?: boolean
      media_urls?: string[]
    }
  ): Promise<{ milestone_id: string }> {
    return this.fetch<{ milestone_id: string }>(`/api/v1/journeys/${journeyId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async addNote(
    journeyId: string,
    data: { content: string; note_type?: string }
  ): Promise<{ note_id: string }> {
    return this.fetch<{ note_id: string }>(`/api/v1/journeys/${journeyId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserContext(): Promise<unknown> {
    return this.fetch<unknown>('/api/v1/journeys/context')
  }

  async getPeptideStats(peptide: string): Promise<unknown> {
    return this.fetch<unknown>(`/api/v1/peptides/${peptide}/stats`)
  }

  // Share endpoints
  async cleanupOldSharedConversations(): Promise<{ deleted: number }> {
    return this.fetch<{ deleted: number }>('/api/v1/admin/shared-conversations/cleanup', {
      method: 'DELETE',
    })
  }

  async deleteAllSharedConversations(): Promise<{ deleted: number }> {
    return this.fetch<{ deleted: number }>('/api/v1/admin/shared-conversations/all', {
      method: 'DELETE',
    })
  }

  async createShareLink(conversationId: string): Promise<{ share_id: string; share_url: string }> {
    // Use local API route for proper Clerk user ID handling
    const response = await fetch(`/api/conversations/${conversationId}/share`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
    return response.json()
  }

  async getSharedConversation(shareId: string): Promise<{
    share_id: string
    title: string
    messages: { role: string; content: string }[]
    created_at: string
    shared_at: string
  }> {
    // Public endpoint - no auth required
    if (!API_BASE) {
      throw new ApiError(503, { error: 'Backend not configured' })
    }
    const url = `${API_BASE}/api/v1/share/${shareId}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
    return response.json()
  }

  // =========================================================================
  // AFFILIATE & HOLISTIC PRODUCTS
  // =========================================================================

  private async fetchPublic<T>(endpoint: string): Promise<T> {
    // Public endpoints that don't require auth
    // Use fallback URL for public endpoints in case API_BASE is not configured
    const baseUrl = API_BASE || 'https://peptide-ai-api-production.up.railway.app'
    const url = `${baseUrl}${endpoint}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
    return response.json()
  }

  async getSymptoms(
    category?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<{ symptoms: Symptom[]; total: number }> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    return this.fetchPublic(`/api/v1/affiliate/symptoms?${params}`)
  }

  async getSymptomBySlug(slug: string): Promise<SymptomWithProducts> {
    const data = await this.fetchPublic<{
      symptom: Symptom
      products: HolisticProduct[]
      labs: LabTest[]
    }>(`/api/v1/affiliate/symptoms/${slug}`)
    return {
      ...data.symptom,
      products: data.products,
      labs: data.labs,
    }
  }

  async getSymptomCategories(): Promise<CategoryCount[]> {
    const data = await this.fetchPublic<{ categories: CategoryCount[] }>(
      '/api/v1/affiliate/categories'
    )
    return data.categories
  }

  async getProducts(
    productType?: string,
    isPeptide?: boolean,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<{ products: HolisticProduct[]; total: number }> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (productType) params.set('product_type', productType)
    if (isPeptide !== undefined) params.set('is_peptide', String(isPeptide))
    if (search) params.set('search', search)
    return this.fetchPublic(`/api/v1/affiliate/products?${params}`)
  }

  async getProductById(productId: string): Promise<{
    product: HolisticProduct
    related_symptoms: Symptom[]
  }> {
    return this.fetchPublic(`/api/v1/affiliate/products/${productId}`)
  }

  async searchSymptomsAndProducts(
    query: string,
    source = 'search'
  ): Promise<SearchResult> {
    const params = new URLSearchParams({ q: query, source })
    return this.fetchPublic(`/api/v1/affiliate/search?${params}`)
  }

  async trackAffiliateClick(data: AffiliateClickData): Promise<{
    click_id: string
    affiliate_url?: string
    product_name: string
  }> {
    const params = new URLSearchParams({
      product_id: data.product_id,
      source: data.source,
    })
    if (data.symptom_id) params.set('symptom_id', data.symptom_id)
    if (data.source_id) params.set('source_id', data.source_id)

    if (!API_BASE) {
      throw new ApiError(503, { error: 'Backend not configured' })
    }

    const url = `${API_BASE}/api/v1/affiliate/click?${params}`
    const response = await fetch(url, { method: 'POST' })
    if (!response.ok) {
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
    return response.json()
  }
}

// Singleton instance
export const api = new ApiClient()
