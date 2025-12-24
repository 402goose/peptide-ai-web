'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { OnboardingFlow, type OnboardingContext } from './OnboardingFlow'
import type { Message, Source } from '@/types'
import { Beaker, Sparkles, ArrowRight } from 'lucide-react'
import { trackSessionStart, trackPageView, trackChatSent, trackSourceClicked } from '@/lib/analytics'

// Common peptide names for tracking
const PEPTIDE_NAMES = [
  'bpc-157', 'bpc157', 'tb-500', 'tb500', 'semaglutide', 'tirzepatide',
  'ipamorelin', 'cjc-1295', 'ghrp-6', 'ghrp-2', 'mk-677', 'pt-141',
  'melanotan', 'aod-9604', 'sermorelin', 'hexarelin', 'epithalon',
  'thymosin', 'll-37', 'ghk-cu', 'selank', 'semax', 'dihexa'
]

function extractPeptideMention(text: string): string | undefined {
  const lower = text.toLowerCase()
  return PEPTIDE_NAMES.find(p => lower.includes(p))
}

interface ChatContainerProps {
  conversationId?: string
}

type ViewState = 'onboarding' | 'ready' | 'chatting'

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [currentSources, setCurrentSources] = useState<Source[]>([])
  const [currentDisclaimers, setCurrentDisclaimers] = useState<string[]>([])
  const [currentFollowUps, setCurrentFollowUps] = useState<string[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(conversationId)
  const [userContext, setUserContext] = useState<OnboardingContext | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasHandledQueryParam = useRef(false)

  // Track if user has started chatting (persists across navigation via sessionStorage)
  const hasStartedChatting = useRef(false)

  // Initialize chatting state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('peptide-ai-chatting')
      if (stored === 'true') {
        hasStartedChatting.current = true
        // Only transition to 'ready' (not chatting) since we may not have messages
        if (viewState === 'onboarding') {
          setViewState('ready')
        }
      }
    }
  }, [])

  // Track session and page view on mount
  useEffect(() => {
    trackSessionStart()
    trackPageView('chat')
  }, [])

  // Determine initial view state
  const getInitialViewState = (): ViewState => {
    if (conversationId) return 'chatting'
    // If user has chatted before in this session, skip onboarding but show ready state
    if (typeof window !== 'undefined' && sessionStorage.getItem('peptide-ai-chatting') === 'true') {
      return 'ready'
    }
    return 'onboarding'
  }
  const [viewState, setViewState] = useState<ViewState>(getInitialViewState)

  // Load existing conversation when navigating to a conversation URL
  useEffect(() => {
    if (conversationId && !activeConversationId) {
      // Only load if we don't already have this conversation active
      // (prevents reloading when we just created it)
      loadConversation(conversationId)
      setViewState('chatting')
    }
  }, [conversationId, activeConversationId])

  // Transition to ready state when input is focused during onboarding
  useEffect(() => {
    if (inputFocused && viewState === 'onboarding') {
      setViewState('ready')
    }
  }, [inputFocused, viewState])

  async function loadConversation(id: string) {
    // Without a backend, we can't load saved conversations
    // Just redirect to fresh chat
    setMessages([])
    setActiveConversationId(undefined)
    setViewState('ready')
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/chat')
    }
  }

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isStreaming) return

    // Track chat sent
    trackChatSent({
      conversationId: activeConversationId,
      messageLength: content.length,
      peptideMentioned: extractPeptideMention(content),
    })

    // Mark that user has started chatting - persists across navigation
    hasStartedChatting.current = true
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    }

    // Transition to chatting state
    setViewState('chatting')

    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent('')
    setCurrentSources([])
    setCurrentDisclaimers([])
    setCurrentFollowUps([])

    try {
      // Try streaming first
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          messages: newMessages.filter(m => m.content).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed, falling back')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
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

              if (data.type === 'conversation_id') {
                setActiveConversationId(data.conversation_id)
              } else if (data.type === 'sources' && data.sources) {
                setCurrentSources(data.sources)
              } else if (data.type === 'content' && data.content) {
                fullContent += data.content
                setStreamingContent(fullContent)
              } else if (data.type === 'done') {
                if (data.disclaimers) setCurrentDisclaimers(data.disclaimers)
                if (data.follow_up_questions) setCurrentFollowUps(data.follow_up_questions)
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add final message
      if (fullContent) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }

    } catch (error) {
      console.error('Streaming failed, trying non-streaming:', error)

      // Fallback to non-streaming
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            messages: newMessages.filter(m => m.content).map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (!response.ok) throw new Error('Failed to get response')

        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, assistantMessage])
        if (data.follow_ups) setCurrentFollowUps(data.follow_ups)
        if (data.disclaimers) setCurrentDisclaimers(data.disclaimers)
      } catch (fallbackError) {
        console.error('All methods failed:', fallbackError)
        const errorMessage: Message = {
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [messages, isLoading, isStreaming])

  function handleFollowUpClick(question: string) {
    handleSendMessage(question)
  }

  // Handle query parameter (e.g., from Stack Builder "Ask About This Stack")
  useEffect(() => {
    const query = searchParams?.get('q')
    if (query && !hasHandledQueryParam.current && !isLoading) {
      hasHandledQueryParam.current = true
      // Clear the query param from URL to prevent re-triggering
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/chat')
      }
      // Send the query immediately
      handleSendMessage(query)
    }
  }, [searchParams, isLoading, handleSendMessage])

  async function handleOnboardingComplete(query: string, context: OnboardingContext) {
    setUserContext(context)

    // Mark that user has started chatting
    hasStartedChatting.current = true
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('peptide-ai-chatting', 'true')
    }

    // Transition to chatting state
    setViewState('chatting')

    // Create a context message that shows selections visually (not as boring text)
    const contextMessage: Message = {
      role: 'user',
      content: '', // Empty - we'll render this specially based on metadata
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'onboarding_context',
        goal: context.primaryGoalLabel,
        conditions: context.conditionLabels,
        experience: context.experienceLevel,
      }
    }
    setMessages([contextMessage])
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent('')
    setCurrentSources([])
    setCurrentDisclaimers([])
    setCurrentFollowUps([])

    try {
      const guidedMessage = `User profile: ${context.experienceLevel} with peptides. Goal: ${context.primaryGoalLabel}. Focus areas: ${context.conditionLabels?.join(', ') || 'general'}. Suggested peptides to discuss: ${context.peptideSuggestions?.join(', ')}. Start by warmly acknowledging their goal, then dive into the most relevant peptides with specific research and protocols.`

      // Use streaming endpoint for progressive response
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: guidedMessage,
          messages: [],
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
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

              if (data.type === 'conversation_id') {
                setActiveConversationId(data.conversation_id)
              } else if (data.type === 'sources' && data.sources) {
                setCurrentSources(data.sources)
              } else if (data.type === 'content' && data.content) {
                fullContent += data.content
                setStreamingContent(fullContent)
              } else if (data.type === 'done') {
                if (data.disclaimers) setCurrentDisclaimers(data.disclaimers)
                if (data.follow_up_questions) setCurrentFollowUps(data.follow_up_questions)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add final message
      if (fullContent) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Failed to start guided journey:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or ask me directly about peptides.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  function handleSkipToChat() {
    setViewState('ready')
    // Focus the input after a brief delay for the animation
    setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
  }

  function handleBackToOnboarding() {
    // Clear session state to allow fresh start
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('peptide-ai-chatting')
    }
    hasStartedChatting.current = false
    setMessages([])
    setActiveConversationId(undefined)
    setViewState('onboarding')
  }

  return (
    <div className="flex h-full flex-col relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Onboarding State */}
          {viewState === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              <OnboardingFlow
                onComplete={handleOnboardingComplete}
                onSkip={handleSkipToChat}
              />
            </motion.div>
          )}

          {/* Ready State - Minimal centered view */}
          {viewState === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full flex flex-col items-center justify-center px-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-center mb-8"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Beaker className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                  What can I help you research?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Ask about peptides, protocols, research findings, or user experiences
                </p>
              </motion.div>

              {/* Quick suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex flex-wrap justify-center gap-2 max-w-xl"
              >
                {[
                  'What peptides help with healing?',
                  'BPC-157 vs TB-500',
                  'Semaglutide for weight loss',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    {suggestion}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </motion.div>

              {/* Back to onboarding */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                onClick={handleBackToOnboarding}
                className="mt-8 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ← Back to guided setup
              </motion.button>
            </motion.div>
          )}

          {/* Chatting State */}
          {viewState === 'chatting' && (
            <motion.div
              key="chatting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {messages.length === 0 && !isLoading ? (
                // Empty state - show helpful prompt
                <div className="h-full flex flex-col items-center justify-center px-4">
                  <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                        <Beaker className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                      What can I help you research?
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                      Ask about peptides, protocols, or research findings
                    </p>
                  </div>
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  streamingContent={streamingContent}
                  sources={currentSources}
                  disclaimers={currentDisclaimers}
                  followUps={currentFollowUps}
                  onFollowUpClick={handleFollowUpClick}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area - Always visible and fixed at bottom */}
      <div className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 safe-area-bottom">
        <div className="mx-auto max-w-3xl px-4 pt-3 pb-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <MessageInput
            ref={inputRef}
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={
              viewState === 'onboarding'
                ? "Or type your question here..."
                : "Ask about peptide research..."
            }
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            showSkipHint={viewState === 'onboarding'}
          />
        </div>
      </div>
    </div>
  )
}
