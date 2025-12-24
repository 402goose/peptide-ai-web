import type { ChatRequest, ChatResponse, ConversationSummary, Conversation, StreamChunk } from '@/types'
import type {
  JourneySummary,
  JourneyDetail,
  CreateJourneyRequest,
  LogDoseRequest,
  LogSymptomsRequest,
} from '@/types/journey'

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

class ApiClient {
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

  async getConversations(limit = 20, offset = 0): Promise<ConversationSummary[]> {
    return this.fetch<ConversationSummary[]>(
      `/api/v1/chat/conversations?limit=${limit}&offset=${offset}`
    )
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.fetch<Conversation>(`/api/v1/chat/conversations/${id}`)
  }

  async deleteConversation(id: string): Promise<void> {
    await this.fetch(`/api/v1/chat/conversations/${id}`, {
      method: 'DELETE',
    })
  }

  async updateConversation(id: string, data: { title?: string }): Promise<void> {
    await this.fetch(`/api/v1/chat/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
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

  async getDoses(journeyId: string): Promise<unknown[]> {
    return this.fetch<unknown[]>(`/api/v1/journeys/${journeyId}/doses`)
  }

  async logSymptoms(journeyId: string, request: LogSymptomsRequest): Promise<{ log_id: string; log_date: string }> {
    return this.fetch<{ log_id: string; log_date: string }>(`/api/v1/journeys/${journeyId}/symptoms`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getSymptoms(journeyId: string): Promise<unknown[]> {
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
    return this.fetch<{ share_id: string; share_url: string }>(`/api/v1/chat/conversations/${conversationId}/share`, {
      method: 'POST',
    })
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
}

// Singleton instance
export const api = new ApiClient()
