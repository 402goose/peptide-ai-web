'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { OnboardingFlow, type OnboardingContext } from './OnboardingFlow'
import type { Message, Source } from '@/types'
import { Beaker, Sparkles, ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackSessionStart, trackPageView, trackChatSent, trackSourceClicked } from '@/lib/analytics'
import { api } from '@/lib/api'

// Limit for anonymous users
const ANONYMOUS_CHAT_LIMIT = 3

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
  const { user, isLoaded: isUserLoaded } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [currentSources, setCurrentSources] = useState<Source[]>([])
  const [currentDisclaimers, setCurrentDisclaimers] = useState<string[]>([])
  const [currentFollowUps, setCurrentFollowUps] = useState<string[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(conversationId)
  const [detectedMode, setDetectedMode] = useState<string>('balanced')
  const [mentionedPeptides, setMentionedPeptides] = useState<string[]>([])
  const [userContext, setUserContext] = useState<OnboardingContext | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const [anonChatCount, setAnonChatCount] = useState(0)
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasHandledQueryParam = useRef(false)

  // Track if user has started chatting (persists across navigation via sessionStorage)
  const hasStartedChatting = useRef(false)

  // Check if user is anonymous
  const isAnonymous = isUserLoaded && !user

  // Load anonymous chat count from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isAnonymous) {
      const count = parseInt(sessionStorage.getItem('peptide-ai-anon-chats') || '0', 10)
      setAnonChatCount(count)
      if (count >= ANONYMOUS_CHAT_LIMIT) {
        setShowSignUpPrompt(true)
      }
    }
  }, [isAnonymous])

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

  // Clean up browser history after OAuth redirects to prevent Google 400 errors on back navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we came from an OAuth flow (referrer contains google or clerk)
      const referrer = document.referrer.toLowerCase()
      const isFromOAuth = referrer.includes('google') ||
                          referrer.includes('clerk') ||
                          referrer.includes('accounts.') ||
                          referrer.includes('oauth')

      // Also check URL for auth-related params that Clerk might add
      const urlParams = new URLSearchParams(window.location.search)
      const hasAuthParams = urlParams.has('__clerk_status') ||
                            urlParams.has('__clerk_created_session')

      if (isFromOAuth || hasAuthParams) {
        // Replace history state to prevent back navigation to OAuth URLs
        window.history.replaceState(null, '', '/chat')

        // Push a new state so the first back goes to our app, not OAuth
        window.history.pushState(null, '', '/chat')
      }

      // Handle popstate (back button) - redirect to home instead of OAuth pages
      const handlePopState = () => {
        // If somehow navigating back would go to an OAuth URL, redirect to home
        if (document.referrer.toLowerCase().includes('google') ||
            document.referrer.toLowerCase().includes('accounts.')) {
          window.history.pushState(null, '', '/chat')
          router.replace('/')
        }
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [router])

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
    // Load if conversationId is set AND it's different from what we have loaded
    // This handles: initial load, switching between conversations, and navigation
    const shouldLoad = conversationId && conversationId !== activeConversationId && !isStreaming && !isLoading

    console.log('[ChatContainer] useEffect check:', {
      conversationId,
      activeConversationId,
      isStreaming,
      isLoading,
      shouldLoad
    })

    if (shouldLoad) {
      console.log('[ChatContainer] Loading conversation:', conversationId)
      loadConversation(conversationId)
      setViewState('chatting')
    } else if (!conversationId && activeConversationId && !isStreaming && !isLoading) {
      // User navigated to /chat (no conversationId) - reset to fresh state
      console.log('[ChatContainer] Resetting to fresh chat')
      setMessages([])
      setActiveConversationId(undefined)
      setViewState('ready')
    }
  }, [conversationId, activeConversationId, isStreaming, isLoading])

  // Transition to ready state when input is focused during onboarding
  useEffect(() => {
    if (inputFocused && viewState === 'onboarding') {
      setViewState('ready')
    }
  }, [inputFocused, viewState])

  async function loadConversation(id: string) {
    console.log('[loadConversation] Starting load for:', id)
    setIsLoading(true)
    try {
      const conversation = await api.getConversation(id)
      console.log('[loadConversation] API response:', conversation)

      // Convert API messages to our format (handle snake_case from backend)
      const messages: Message[] = (conversation.messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content || '',
        timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
        sources: msg.sources,
        disclaimers: msg.disclaimers,
        followUps: msg.follow_ups || msg.followUps,
        metadata: msg.metadata,
      })).filter((msg: Message) => msg.content) // Filter out empty messages

      if (messages.length === 0) {
        // No valid messages - redirect to fresh chat
        console.log('Conversation has no messages, starting fresh')
        setMessages([])
        setActiveConversationId(undefined)
        setViewState('ready')
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/chat')
        }
        return
      }

      setMessages(messages)
      setActiveConversationId(conversation.conversation_id)
      setViewState('chatting')

      // Mark that user has started chatting
      hasStartedChatting.current = true
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('peptide-ai-chatting', 'true')
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
      // Fallback to fresh chat if conversation not found
      setMessages([])
      setActiveConversationId(undefined)
      setViewState('ready')
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/chat')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isStreaming) return

    // Check anonymous chat limit
    if (isAnonymous) {
      const currentCount = parseInt(sessionStorage.getItem('peptide-ai-anon-chats') || '0', 10)
      if (currentCount >= ANONYMOUS_CHAT_LIMIT) {
        setShowSignUpPrompt(true)
        return
      }
      // Increment anonymous chat count
      const newCount = currentCount + 1
      sessionStorage.setItem('peptide-ai-anon-chats', String(newCount))
      setAnonChatCount(newCount)
      if (newCount >= ANONYMOUS_CHAT_LIMIT) {
        // Will show prompt after this message completes
      }
    }

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
          conversation_id: activeConversationId, // Continue existing conversation
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
                // Update URL to include conversation ID (enables sharing)
                // Use router.replace to trigger usePathname update in layout
                if (!conversationId) {
                  router.replace(`/chat/c/${data.conversation_id}`, { scroll: false })
                  // Dispatch event for layout to enable share button immediately
                  window.dispatchEvent(new CustomEvent('conversationCreated', { detail: data.conversation_id }))
                }
              } else if (data.type === 'sources' && data.sources) {
                setCurrentSources(data.sources)
              } else if (data.type === 'mode' && data.mode) {
                setDetectedMode(data.mode)
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

      // Extract peptide names mentioned for feature suggestions
      const extractedPeptides = PEPTIDE_NAMES.filter(p =>
        fullContent.toLowerCase().includes(p.toLowerCase())
      )
      if (extractedPeptides.length > 0) {
        setMentionedPeptides(extractedPeptides)
      }

      // Add final message with metadata
      if (fullContent) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
          metadata: {
            mode: detectedMode,
            peptides: extractedPeptides,
          }
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
            conversation_id: activeConversationId, // Continue existing conversation
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

      // Show sign-up prompt after response if anonymous limit reached
      if (isAnonymous) {
        const count = parseInt(sessionStorage.getItem('peptide-ai-anon-chats') || '0', 10)
        if (count >= ANONYMOUS_CHAT_LIMIT) {
          setShowSignUpPrompt(true)
        }
      }
    }
  }, [messages, isLoading, isStreaming, isAnonymous])

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
      // Create a user-friendly first message that will make a good title
      // Format: "Help me with [goal] - focusing on [conditions]"
      const userFriendlyMessage = context.conditionLabels?.length
        ? `Help me with ${context.primaryGoalLabel?.toLowerCase()} - focusing on ${context.conditionLabels.join(', ')}`
        : `Help me with ${context.primaryGoalLabel?.toLowerCase()}`

      // System context for the AI (not shown to user, but guides the response)
      const systemContext = `[Context: User is ${context.experienceLevel} with peptides. Suggested peptides: ${context.peptideSuggestions?.join(', ')}. Please acknowledge their goal warmly and provide specific research-backed recommendations.]`

      // Use streaming endpoint for progressive response
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${userFriendlyMessage}\n\n${systemContext}`,
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
                // Update URL to include conversation ID (enables sharing)
                // Use router.replace to trigger usePathname update in layout
                router.replace(`/chat/c/${data.conversation_id}`, { scroll: false })
                // Dispatch event for layout to enable share button immediately
                window.dispatchEvent(new CustomEvent('conversationCreated', { detail: data.conversation_id }))
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
                  detectedMode={detectedMode}
                  mentionedPeptides={mentionedPeptides}
                  conversationId={activeConversationId}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area - Hidden on mobile during onboarding to save space */}
      <div className={`shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 safe-area-bottom ${viewState === 'onboarding' ? 'hidden md:block' : ''}`}>
        <div className="mx-auto max-w-3xl px-4 pt-3 pb-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {showSignUpPrompt ? (
            // Sign up prompt for anonymous users who hit the limit
            <div className="text-center py-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Sign up to continue chatting and save your conversations
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/sign-up">
                  <Button size="sm" className="gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="sm" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
