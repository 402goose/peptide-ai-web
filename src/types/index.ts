// API Types matching backend

export interface Source {
  title: string
  citation: string
  url: string
  type: 'pubmed' | 'arxiv' | 'biorxiv' | 'reddit' | 'user_journey' | 'web'
}

export interface ChatRequest {
  message: string
  conversation_id?: string
  context?: Record<string, unknown>
}

export interface ChatResponse {
  conversation_id: string
  message: string
  sources: Source[]
  disclaimers: string[]
  follow_up_questions: string[]
  metadata: {
    model: string
    context_chunks: number
    elapsed_ms: number
    error?: string
  }
}

export interface MessageMetadata {
  type?: 'onboarding_context'
  goal?: string
  conditions?: string[]
  experience?: string
  mode?: string
  peptides?: string[]
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  sources?: Source[]
  disclaimers?: string[]
  followUps?: string[]
  metadata?: MessageMetadata
}

export interface ConversationSummary {
  conversation_id: string
  title: string
  preview: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface Conversation extends ConversationSummary {
  messages: Message[]
}

// Streaming chunk types
export interface StreamChunk {
  type: 'conversation_id' | 'sources' | 'content' | 'done'
  conversation_id?: string
  sources?: Source[]
  content?: string
  disclaimers?: string[]
  follow_up_questions?: string[]
}

// Source type colors for citations
export const SOURCE_COLORS: Record<Source['type'], string> = {
  pubmed: '#3b82f6',    // Blue
  arxiv: '#f97316',     // Orange
  biorxiv: '#22c55e',   // Green
  reddit: '#ef4444',    // Red
  user_journey: '#a855f7', // Purple
  web: '#6b7280',       // Gray
}

export const SOURCE_LABELS: Record<Source['type'], string> = {
  pubmed: 'PubMed',
  arxiv: 'arXiv',
  biorxiv: 'bioRxiv',
  reddit: 'Reddit',
  user_journey: 'User Experience',
  web: 'Web',
}
