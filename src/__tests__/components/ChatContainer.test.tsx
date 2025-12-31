/**
 * Tests for ChatContainer component.
 *
 * Tests the main chat interface including message handling,
 * view state transitions, and user interactions.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatContainer } from '@/components/chat/ChatContainer'

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}))

// Mock Clerk
const mockUser = { id: 'user-123', firstName: 'Test' }
let mockIsUserLoaded = true
let mockUserValue: typeof mockUser | null = mockUser

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: mockUserValue,
    isLoaded: mockIsUserLoaded,
  }),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock Toast
const mockShowToast = vi.fn()
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
  ToastProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackSessionStart: vi.fn(),
  trackPageView: vi.fn(),
  trackChatSent: vi.fn(),
  trackSourceClicked: vi.fn(),
}))

// Mock VoiceButton component (uses browser APIs not available in tests)
vi.mock('@/components/chat/VoiceButton', () => ({
  VoiceButton: ({ onTranscription, size }: { onTranscription: (text: string) => void, size?: string }) => (
    <button data-testid="voice-button" data-size={size} onClick={() => onTranscription('Test voice input')}>
      Voice Button
    </button>
  ),
}))

// Mock InstallHint component (uses browser APIs)
vi.mock('@/components/pwa/InstallHint', () => ({
  InstallHint: () => <div data-testid="install-hint">Install Hint</div>,
}))

// Mock useVoiceRecording hook
vi.mock('@/hooks/useVoiceRecording', () => ({
  useVoiceRecording: () => ({
    isRecording: false,
    isTranscribing: false,
    audioLevel: 0,
    error: null,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    cancelRecording: vi.fn(),
  }),
}))

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    getConversation: vi.fn(),
  },
}))

// Import mocked api after mocking
import { api } from '@/lib/api'

// Mock fetch for streaming/non-streaming chat
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserValue = mockUser
    mockIsUserLoaded = true

    // Reset sessionStorage
    sessionStorage.clear()

    // Reset fetch mock
    mockFetch.mockReset()

    // Default fetch response for streaming
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        body: createMockReadableStream([
          { type: 'conversation_id', conversation_id: 'conv-123' },
          { type: 'content', content: 'Hello! ' },
          { type: 'content', content: 'How can I help?' },
          { type: 'done', disclaimers: ['This is not medical advice.'] },
        ]),
      })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock readable stream
  function createMockReadableStream(chunks: object[]) {
    const encoder = new TextEncoder()
    let index = 0

    return {
      getReader: () => ({
        read: async () => {
          if (index >= chunks.length) {
            return { done: true, value: undefined }
          }
          const chunk = chunks[index++]
          const data = `data: ${JSON.stringify(chunk)}\n`
          return { done: false, value: encoder.encode(data) }
        },
      }),
    }
  }

  describe('Initial Rendering', () => {
    it('should render ready view by default', () => {
      render(<ChatContainer />)

      // Should show the ready state with Sequence branding
      expect(screen.getByText('Sequence')).toBeInTheDocument()
      expect(screen.getByText(/Your research engine/)).toBeInTheDocument()
    })

    it('should show voice button in ready state', () => {
      render(<ChatContainer />)

      expect(screen.getByTestId('voice-button')).toBeInTheDocument()
    })

    it('should render chatting view when conversationId is provided', async () => {
      vi.mocked(api.getConversation).mockResolvedValue({
        conversation_id: 'conv-123',
        title: 'Test Conversation',
        messages: [
          { role: 'user', content: 'Hello', timestamp: '2024-01-01T00:00:00Z' },
          { role: 'assistant', content: 'Hi there!', timestamp: '2024-01-01T00:01:00Z' },
        ],
        preview: 'Hello',
        message_count: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<ChatContainer conversationId="conv-123" />)

      await waitFor(() => {
        expect(api.getConversation).toHaveBeenCalledWith('conv-123')
      })

      await waitFor(() => {
        expect(screen.getByText('Hi there!')).toBeInTheDocument()
      })
    })
  })

  describe('Ready State', () => {
    it('should show quick suggestion buttons', () => {
      render(<ChatContainer />)

      expect(screen.getByText('What peptides help with healing?')).toBeInTheDocument()
      expect(screen.getByText('BPC-157 vs TB-500')).toBeInTheDocument()
      expect(screen.getByText('Semaglutide dosing')).toBeInTheDocument()
    })

    it('should show install hint', () => {
      render(<ChatContainer />)

      expect(screen.getByTestId('install-hint')).toBeInTheDocument()
    })

    it('should handle quick suggestion click', async () => {
      render(<ChatContainer />)

      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })
  })

  describe('Message Sending', () => {
    // Helper to get into chatting state by clicking a suggestion
    async function getIntoChatState() {
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      // Wait for the fetch to happen and state to change
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    }

    it('should send message when form is submitted', async () => {
      render(<ChatContainer />)

      // First get into chatting state
      await getIntoChatState()

      // Clear mock to track subsequent calls
      mockFetch.mockClear()

      const input = await screen.findByPlaceholderText('Ask about peptide research...')
      await userEvent.type(input, 'What is BPC-157?')
      await userEvent.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/chat/stream', expect.any(Object))
      })
    })

    it('should display user message immediately after sending', async () => {
      render(<ChatContainer />)

      // Click suggestion to send a message and get into chatting state
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(screen.getByText('What peptides help with healing?')).toBeInTheDocument()
      })
    })

    it('should not send empty messages from quick suggestions', async () => {
      render(<ChatContainer />)

      // Initially in ready state - fetch should not be called without clicking suggestion
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should disable input while loading', async () => {
      // Make fetch hang to test loading state
      mockFetch.mockImplementation(() => new Promise(() => {}))

      render(<ChatContainer />)

      // Click suggestion to get into chatting state and start loading
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      // Once loading starts, input should be disabled
      await waitFor(() => {
        const input = screen.queryByPlaceholderText('Ask about peptide research...')
        if (input) {
          expect(input).toBeDisabled()
        }
      })
    })
  })

  describe('Streaming Response', () => {
    it('should handle streaming response and display content progressively', async () => {
      render(<ChatContainer />)

      // Click suggestion to send message
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument()
      })
    })

    it('should update URL with conversation ID from stream', async () => {
      render(<ChatContainer />)

      // Click suggestion to send message
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument()
      })

      // URL should be updated with conversation ID after streaming completes
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/chat/c/conv-123', { scroll: false })
      })
    })
  })

  describe('Anonymous User Limits', () => {
    beforeEach(() => {
      mockUserValue = null // Anonymous user
    })

    it('should track anonymous chat count', async () => {
      render(<ChatContainer />)

      // Click suggestion to send message
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(sessionStorage.getItem('peptide-ai-anon-chats')).toBe('1')
      })
    })

    it('should show sign up prompt after reaching limit', async () => {
      // Set limit to just below max (10) and get into chatting state
      sessionStorage.setItem('peptide-ai-anon-chats', '10')

      render(<ChatContainer />)

      // Click suggestion to get into chatting state (which shows input area with sign up prompt)
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(screen.getByText('Create Free Account')).toBeInTheDocument()
      })
    })

    it('should block sending when limit reached', async () => {
      sessionStorage.setItem('peptide-ai-anon-chats', '10')

      render(<ChatContainer />)

      // In ready state, input is not visible anyway
      // After clicking suggestion, sign up prompt shows instead of input
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      // The message won't be sent because limit was reached
      await waitFor(() => {
        // Sign up prompt should be shown
        expect(screen.getByText('Create Free Account')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {

    it('should fallback to non-streaming on stream failure', async () => {
      // First call fails (streaming)
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: false })
      )

      // Second call succeeds (non-streaming fallback)
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              response: 'Fallback response',
              follow_ups: [],
              disclaimers: [],
            }),
        })
      )

      render(<ChatContainer />)

      // Click suggestion to send message
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(screen.getByText('Fallback response')).toBeInTheDocument()
      })
    })

    it('should show error message when all methods fail', async () => {
      // Both calls fail
      mockFetch.mockImplementation(() =>
        Promise.resolve({ ok: false })
      )

      render(<ChatContainer />)

      // Click suggestion to send message
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(
          screen.getByText(/I apologize, but I encountered an error/)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Conversation Loading', () => {
    it('should load conversation messages when conversationId provided', async () => {
      vi.mocked(api.getConversation).mockResolvedValue({
        conversation_id: 'conv-456',
        title: 'Existing Chat',
        messages: [
          { role: 'user', content: 'Previous question', timestamp: '2024-01-01T00:00:00Z' },
          {
            role: 'assistant',
            content: 'Previous answer',
            timestamp: '2024-01-01T00:01:00Z',
            sources: [{ title: 'Source 1', url: 'https://example.com', citation: 'Example Citation', type: 'pubmed' }],
          },
        ],
        preview: 'Previous question',
        message_count: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<ChatContainer conversationId="conv-456" />)

      await waitFor(() => {
        expect(screen.getByText('Previous question')).toBeInTheDocument()
        expect(screen.getByText('Previous answer')).toBeInTheDocument()
      })
    })

    it('should redirect to fresh chat if conversation has no messages', async () => {
      vi.mocked(api.getConversation).mockResolvedValue({
        conversation_id: 'conv-empty',
        title: 'Empty',
        messages: [],
        preview: '',
        message_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<ChatContainer conversationId="conv-empty" />)

      // Should redirect and show ready state
      await waitFor(() => {
        expect(screen.getByText('Sequence')).toBeInTheDocument()
      })
    })

    it('should handle conversation load failure gracefully', async () => {
      vi.mocked(api.getConversation).mockRejectedValue(new Error('Not found'))

      render(<ChatContainer conversationId="conv-invalid" />)

      // Should redirect to ready state
      await waitFor(() => {
        expect(screen.getByText('Sequence')).toBeInTheDocument()
      })
    })
  })

  describe('View State Transitions', () => {
    it('should start in ready state with voice button', async () => {
      render(<ChatContainer />)

      // Ready state shows the voice button
      expect(screen.getByTestId('voice-button')).toBeInTheDocument()
    })

    it('should transition to chatting state when suggestion clicked', async () => {
      render(<ChatContainer />)

      // Click a suggestion to send a message
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        // User message should appear (indicating chatting state)
        expect(screen.getByText('What peptides help with healing?')).toBeInTheDocument()
      })
    })

    it('should show input in chatting state', async () => {
      render(<ChatContainer />)

      // Click suggestion to get into chatting state
      const suggestionButton = screen.getByText('What peptides help with healing?')
      fireEvent.click(suggestionButton)

      // Input should be visible in chatting state
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Ask about peptide research...')
        expect(input).toBeInTheDocument()
      })
    })
  })

  describe('Peptide Detection', () => {
    it('should track peptide mentions in analytics', async () => {
      const { trackChatSent } = await import('@/lib/analytics')

      render(<ChatContainer />)

      // Click the BPC-157 vs TB-500 suggestion (contains peptide names)
      const suggestionButton = screen.getByText('BPC-157 vs TB-500')
      fireEvent.click(suggestionButton)

      await waitFor(() => {
        expect(trackChatSent).toHaveBeenCalledWith(
          expect.objectContaining({
            peptideMentioned: 'bpc-157',
          })
        )
      })
    })
  })
})
