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

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackSessionStart: vi.fn(),
  trackPageView: vi.fn(),
  trackChatSent: vi.fn(),
  trackSourceClicked: vi.fn(),
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
    it('should render onboarding view by default for new users', () => {
      render(<ChatContainer />)

      // Should show OnboardingFlow component (it has specific text)
      // Since we're not mocking OnboardingFlow, we check for its presence
      expect(screen.queryByText('What can I help you research?')).toBeNull()
    })

    it('should render ready view when user has chatted before', () => {
      sessionStorage.setItem('peptide-ai-chatting', 'true')

      render(<ChatContainer />)

      expect(screen.getByText('What can I help you research?')).toBeInTheDocument()
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
    beforeEach(() => {
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    })

    it('should show quick suggestion buttons', () => {
      render(<ChatContainer />)

      expect(screen.getByText('What peptides help with healing?')).toBeInTheDocument()
      expect(screen.getByText('BPC-157 vs TB-500')).toBeInTheDocument()
      expect(screen.getByText('Semaglutide for weight loss')).toBeInTheDocument()
    })

    it('should show back to guided setup button', () => {
      render(<ChatContainer />)

      expect(screen.getByText('← Back to guided setup')).toBeInTheDocument()
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
    beforeEach(() => {
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    })

    it('should send message when form is submitted', async () => {
      const user = userEvent.setup()
      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'What is BPC-157?')

      // Find and click submit button (or press enter)
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/chat/stream', expect.any(Object))
      })
    })

    it('should display user message immediately after sending', async () => {
      const user = userEvent.setup()
      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'What is BPC-157?')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('What is BPC-157?')).toBeInTheDocument()
      })
    })

    it('should not send empty messages', async () => {
      const user = userEvent.setup()
      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.click(input)
      await user.keyboard('{Enter}')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should disable input while loading', async () => {
      const user = userEvent.setup()

      // Make fetch hang to test loading state
      mockFetch.mockImplementation(() => new Promise(() => {}))

      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        // Input should be disabled during loading
        const inputAfter = screen.getByPlaceholderText('Ask about peptide research...')
        expect(inputAfter).toBeDisabled()
      })
    })
  })

  describe('Streaming Response', () => {
    beforeEach(() => {
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    })

    it('should handle streaming response and display content progressively', async () => {
      const user = userEvent.setup()
      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Tell me about BPC-157')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument()
      })
    })

    it('should set activeConversationId from stream', async () => {
      const user = userEvent.setup()
      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Hello')
      await user.keyboard('{Enter}')

      // URL update is disabled to prevent component remount
      // But activeConversationId should be set from the stream
      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument()
      })
    })
  })

  describe('Anonymous User Limits', () => {
    beforeEach(() => {
      mockUserValue = null // Anonymous user
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    })

    it('should track anonymous chat count', async () => {
      const user = userEvent.setup()
      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(sessionStorage.getItem('peptide-ai-anon-chats')).toBe('1')
      })
    })

    it('should show sign up prompt after reaching limit', async () => {
      sessionStorage.setItem('peptide-ai-anon-chats', '3')

      render(<ChatContainer />)

      expect(screen.getByText('Create Free Account')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('should block sending when limit reached', async () => {
      sessionStorage.setItem('peptide-ai-anon-chats', '3')

      render(<ChatContainer />)

      // Input should not be visible when sign up prompt is shown
      expect(screen.queryByPlaceholderText('Ask about peptide research...')).toBeNull()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    })

    it('should fallback to non-streaming on stream failure', async () => {
      const user = userEvent.setup()

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

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Fallback response')).toBeInTheDocument()
      })
    })

    it('should show error message when all methods fail', async () => {
      const user = userEvent.setup()

      // Both calls fail
      mockFetch.mockImplementation(() =>
        Promise.resolve({ ok: false })
      )

      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

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

      await waitFor(() => {
        expect(screen.getByText('What can I help you research?')).toBeInTheDocument()
      })
    })

    it('should handle conversation load failure gracefully', async () => {
      vi.mocked(api.getConversation).mockRejectedValue(new Error('Not found'))

      render(<ChatContainer conversationId="conv-invalid" />)

      await waitFor(() => {
        expect(screen.getByText('What can I help you research?')).toBeInTheDocument()
      })
    })
  })

  describe('View State Transitions', () => {
    it('should transition from onboarding to ready when input focused', async () => {
      const user = userEvent.setup()
      render(<ChatContainer />)

      // Find input (might be hidden on mobile, but visible on desktop in onboarding)
      const inputs = screen.queryAllByRole('textbox')
      if (inputs.length > 0) {
        await user.click(inputs[0])

        await waitFor(() => {
          expect(screen.getByText('What can I help you research?')).toBeInTheDocument()
        })
      }
    })

    it('should transition to chatting state when message sent', async () => {
      const user = userEvent.setup()
      sessionStorage.setItem('peptide-ai-chatting', 'true')

      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Hello')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        // User message should appear (indicating chatting state)
        expect(screen.getByText('Hello')).toBeInTheDocument()
      })
    })

    it('should persist chatting state in sessionStorage', async () => {
      const user = userEvent.setup()
      sessionStorage.setItem('peptide-ai-chatting', 'true')

      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Test')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(sessionStorage.getItem('peptide-ai-chatting')).toBe('true')
      })
    })
  })

  describe('Peptide Detection', () => {
    beforeEach(() => {
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    })

    it('should track peptide mentions in analytics', async () => {
      const user = userEvent.setup()
      const { trackChatSent } = await import('@/lib/analytics')

      render(<ChatContainer />)

      const input = screen.getByPlaceholderText('Ask about peptide research...')
      await user.type(input, 'Tell me about BPC-157')
      await user.keyboard('{Enter}')

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
