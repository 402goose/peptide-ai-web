'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { VoiceButton } from './VoiceButton'
import { JourneyPrompt } from './JourneyPrompt'
import { OnboardingFlow } from './OnboardingFlow'
import type { OnboardingContext } from './OnboardingFlow'
import { InstallHint } from '@/components/pwa/InstallHint'
import type { Message, Source } from '@/types'
import { Beaker, Sparkles, ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/Toast'
import { trackSessionStart, trackPageView, trackChatSent } from '@/lib/analytics'
import { api } from '@/lib/api'

// Higher limit for anonymous users - let them experience the app first
const ANONYMOUS_CHAT_LIMIT = 10

// Common peptide names for tracking - include variations
const PEPTIDE_NAMES = [
  'bpc-157', 'bpc157', 'bpc 157',
  'tb-500', 'tb500', 'tb 500',
  'semaglutide', 'tirzepatide', 'retatrutide',
  'ipamorelin', 'cjc-1295', 'cjc1295', 'cjc 1295',
  'ghrp-6', 'ghrp6', 'ghrp-2', 'ghrp2',
  'mk-677', 'mk677', 'mk 677', 'ibutamoren',
  'pt-141', 'pt141', 'bremelanotide',
  'melanotan', 'mt-2', 'mt2',
  'aod-9604', 'aod9604',
  'sermorelin', 'hexarelin', 'epithalon', 'epitalon',
  'thymosin', 'thymalin', 'ta-1', 'tb4',
  'll-37', 'ghk-cu', 'ghk cu', 'ghkcu',
  'selank', 'semax', 'dihexa',
  'kisspeptin', 'gonadorelin', 'tesamorelin',
  'mots-c', 'motsc', 'ss-31', 'humanin',
  'peptide', 'peptides'
]

function extractPeptideMention(text: string): string | undefined {
  const lower = text.toLowerCase()
  return PEPTIDE_NAMES.find(p => lower.includes(p))
}

// More robust peptide extraction for AI responses
function extractAllPeptides(text: string): string[] {
  const lower = text.toLowerCase()
  const found = new Set<string>()

  // Check for specific peptide names
  for (const name of PEPTIDE_NAMES) {
    if (lower.includes(name) && name !== 'peptide' && name !== 'peptides') {
      // Normalize the name (e.g., "bpc 157" -> "BPC-157")
      const normalized = name
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/(\d)/, '-$1')
        .replace(/--/g, '-')
      found.add(normalized)
    }
  }

  return Array.from(found)
}

interface ChatContainerProps {
  conversationId?: string
}

type ViewState = 'ready' | 'chatting'

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { showToast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [currentSources, setCurrentSources] = useState<Source[]>([])
  const [currentDisclaimers, setCurrentDisclaimers] = useState<string[]>([])
  const [currentFollowUps, setCurrentFollowUps] = useState<string[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined)
  const [isInitialLoad, setIsInitialLoad] = useState(!!conversationId)
  const [detectedMode, setDetectedMode] = useState<string>('balanced')
  const [mentionedPeptides, setMentionedPeptides] = useState<string[]>([])
  const [userContext, setUserContext] = useState<OnboardingContext | null>(null)
  const [journeyPromptDismissed, setJourneyPromptDismissed] = useState(false)
  const [anonChatCount, setAnonChatCount] = useState(0)
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false)
  const [pendingVoiceText, setPendingVoiceText] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasHandledQueryParam = useRef(false)

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

  // Track session and page view on mount
  useEffect(() => {
    trackSessionStart()
    trackPageView('chat')
  }, [])

  // Clean up browser history after OAuth redirects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer.toLowerCase()
      const isFromOAuth = referrer.includes('google') ||
                          referrer.includes('clerk') ||
                          referrer.includes('accounts.') ||
                          referrer.includes('oauth')

      const urlParams = new URLSearchParams(window.location.search)
      const hasAuthParams = urlParams.has('__clerk_status') ||
                            urlParams.has('__clerk_created_session')

      if (isFromOAuth || hasAuthParams) {
        window.history.replaceState(null, '', '/chat')
        window.history.pushState(null, '', '/chat')
      }
    }
  }, [])

  // Determine initial view state - simple: if we have a conversation, show it, otherwise ready
  const getInitialViewState = (): ViewState => {
    return conversationId ? 'chatting' : 'ready'
  }
  const [viewState, setViewState] = useState<ViewState>(getInitialViewState)

  // Track if we're in the middle of creating a new conversation
  const isCreatingConversation = useRef(false)
  const creatingConversationIdRef = useRef<string | null>(null)
  // Track last conversation ID to detect navigation
  const lastConversationIdRef = useRef<string | undefined>(conversationId)

  // Load existing conversation OR reset when navigating to /chat
  useEffect(() => {
    const isNewlyCreatedConversation = conversationId === creatingConversationIdRef.current
    const shouldLoad = conversationId &&
      conversationId !== activeConversationId &&
      !isStreaming &&
      !isLoading &&
      !isCreatingConversation.current &&
      !isNewlyCreatedConversation

    if (shouldLoad) {
      loadConversation(conversationId)
      setViewState('chatting')
    }

    // Reset to fresh state when navigating from a conversation to /chat
    // This is the fix for "+ New Research Query" not working
    const navigatedAwayFromConversation = lastConversationIdRef.current && !conversationId

    if (navigatedAwayFromConversation && !isStreaming && !isLoading && !isCreatingConversation.current) {
      // Reset everything
      setMessages([])
      setActiveConversationId(undefined)
      setCurrentSources([])
      setCurrentDisclaimers([])
      setCurrentFollowUps([])
      setIsInitialLoad(false)
      setViewState('ready')
      creatingConversationIdRef.current = null
    }

    // Update the ref for next comparison
    lastConversationIdRef.current = conversationId
  }, [conversationId, activeConversationId, isStreaming, isLoading])

  async function loadConversation(id: string) {
    setIsLoading(true)
    try {
      const conversation = await api.getConversation(id)

      const loadedMessages: Message[] = (conversation.messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content || '',
        timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
        sources: msg.sources,
        disclaimers: msg.disclaimers,
        followUps: msg.follow_ups || msg.followUps,
        metadata: msg.metadata,
      })).filter((msg: Message) => msg.content)

      if (loadedMessages.length === 0) {
        setMessages([])
        setActiveConversationId(id)
        setViewState('ready')
        router.replace('/chat')
        return
      }

      setMessages(loadedMessages)
      setActiveConversationId(conversation.conversation_id)
      setViewState('chatting')

      const lastAssistantMsg = [...loadedMessages].reverse().find(m => m.role === 'assistant')
      if (lastAssistantMsg) {
        if (lastAssistantMsg.sources) setCurrentSources(lastAssistantMsg.sources)
        if (lastAssistantMsg.disclaimers) setCurrentDisclaimers(lastAssistantMsg.disclaimers)
        if (lastAssistantMsg.followUps) setCurrentFollowUps(lastAssistantMsg.followUps)
      }
    } catch (error) {
      console.error('[loadConversation] Failed:', error)
      setActiveConversationId(id)
      setMessages([])
      setViewState('ready')
      router.replace('/chat')
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
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
      const newCount = currentCount + 1
      sessionStorage.setItem('peptide-ai-anon-chats', String(newCount))
      setAnonChatCount(newCount)
    }

    trackChatSent({
      conversationId: activeConversationId,
      messageLength: content.length,
      peptideMentioned: extractPeptideMention(content),
    })

    setViewState('chatting')

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
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversation_id: activeConversationId,
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
      let newConversationId: string | undefined

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
                newConversationId = data.conversation_id
                setActiveConversationId(data.conversation_id)
                window.dispatchEvent(new CustomEvent('conversationCreated', { detail: data.conversation_id }))
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
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Use robust peptide extraction
      const extractedPeptides = extractAllPeptides(fullContent)
      if (extractedPeptides.length > 0) {
        setMentionedPeptides(extractedPeptides)

        // Set user context for JourneyPrompt if we have peptides mentioned
        // This allows the journey prompt to appear without requiring onboarding flow
        if (!userContext) {
          setUserContext({
            primaryGoal: 'research',
            primaryGoalLabel: 'Peptide Research',
            goals: [{
              id: 'research',
              label: 'Peptide Research',
              priority: 1,
              peptides: extractedPeptides,
            }],
            conditions: [],
            experienceLevel: 'some',
            peptideSuggestions: extractedPeptides,
          })
        }
      } else if (!userContext && fullContent.toLowerCase().includes('peptide')) {
        // Even if no specific peptides found, show journey prompt if discussing peptides
        setUserContext({
          primaryGoal: 'research',
          primaryGoalLabel: 'Peptide Research',
          goals: [{
            id: 'research',
            label: 'Peptide Research',
            priority: 1,
            peptides: [],
          }],
          conditions: [],
          experienceLevel: 'new',
          peptideSuggestions: [],
        })
      }

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

        if (!conversationId && newConversationId) {
          router.replace(`/chat/c/${newConversationId}`, { scroll: false })
        }
      }

    } catch (error) {
      console.error('Streaming failed, trying non-streaming:', error)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversation_id: activeConversationId,
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
      // Delay clearing streaming state to allow smooth transition
      // The message is already added to messages array, so we just need to
      // let React reconcile before hiding the streaming bubble
      requestAnimationFrame(() => {
        setIsStreaming(false)
        // Clear streaming content after a brief delay for smooth handoff
        setTimeout(() => setStreamingContent(''), 50)
      })

      if (isAnonymous) {
        const count = parseInt(sessionStorage.getItem('peptide-ai-anon-chats') || '0', 10)
        if (count >= ANONYMOUS_CHAT_LIMIT) {
          setShowSignUpPrompt(true)
        }
      }
    }
  }, [messages, isLoading, isStreaming, isAnonymous, activeConversationId, conversationId, detectedMode, router])

  function handleAddToStack(peptideId: string) {
    if (typeof window === 'undefined') return

    const STORAGE_KEY = 'peptide-ai-current-stack'
    const existing = localStorage.getItem(STORAGE_KEY)
    const currentStack: string[] = existing ? JSON.parse(existing) : []

    if (currentStack.includes(peptideId)) {
      showToast(`${peptideId} is already in your stack`, 'info')
      return
    }

    if (currentStack.length >= 6) {
      showToast('Stack is full (max 6 peptides)', 'warning')
      return
    }

    currentStack.push(peptideId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStack))
    showToast(`Added ${peptideId} to your stack`, 'success')
  }

  // Handle "Learn More" clicks on peptide pills - send message in current chat
  function handleLearnMore(message: string) {
    handleSendMessage(message)
  }

  // Handle voice transcription from big button
  function handleVoiceTranscription(text: string) {
    if (text.trim()) {
      handleSendMessage(text)
    }
  }

  // Handle onboarding flow completion
  function handleOnboardingComplete(query: string, context: OnboardingContext) {
    setUserContext(context)
    setShowOnboarding(false)
    setViewState('chatting')

    // Create a styled context message showing user's selections
    const contextMessage: Message = {
      role: 'user',
      content: '', // Empty content - the metadata drives the display
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'onboarding_context',
        goal: context.primaryGoalLabel || context.primaryGoal,
        conditions: context.conditionLabels || context.conditions,
        experience: context.experienceLevel,
      }
    }

    // Generate the actual query message
    const goalLabels = context.goals?.map(g => g.label).join(' and ') || 'peptide research'
    const peptides = context.peptideSuggestions?.slice(0, 3).join(', ') || ''

    const openingMessage = context.experienceLevel === 'new'
      ? `I'm interested in ${goalLabels}. I'm new to peptides${peptides ? ` and would like to learn about ${peptides}` : ''}. Can you give me an introduction and recommendations?`
      : `I'm looking to optimize my ${goalLabels} protocol${peptides ? ` with ${peptides}` : ''}. What should I know about dosing, timing, and best practices?`

    // Add context message first, then send the actual query
    setMessages([contextMessage])

    // Small delay to let the context message render, then send the query
    setTimeout(() => {
      handleSendMessage(openingMessage)
    }, 100)
  }

  // Handle query parameter (from Stack Builder)
  useEffect(() => {
    const query = searchParams?.get('q')
    const stackAction = searchParams?.get('stack')

    if (query && !hasHandledQueryParam.current && !isLoading) {
      hasHandledQueryParam.current = true
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/chat')
      }
      handleSendMessage(query)
    }

    if (stackAction === 'ask' && !hasHandledQueryParam.current && !isLoading && typeof window !== 'undefined') {
      hasHandledQueryParam.current = true

      const savedStack = localStorage.getItem('peptide-ai-current-stack')
      const savedGoals = localStorage.getItem('peptide-ai-selected-goals')

      if (savedStack) {
        try {
          const peptideIds: string[] = JSON.parse(savedStack)
          const goalIds: string[] = savedGoals ? JSON.parse(savedGoals) : []

          if (peptideIds.length > 0) {
            const peptideNames = peptideIds.map(id =>
              id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            ).join(', ')

            const goalsText = goalIds.length > 0
              ? ` My goals are: ${goalIds.join(', ')}.`
              : ''

            const stackQuery = `I'm building a peptide stack with: ${peptideNames}.${goalsText} Can you review this combination and give me advice on dosing, timing, and any synergies or concerns I should know about?`

            window.history.replaceState(null, '', '/chat')
            handleSendMessage(stackQuery)
          }
        } catch (e) {
          console.error('Failed to load stack:', e)
        }
      }
    }
  }, [searchParams, isLoading, handleSendMessage])

  const showLoadingState = isInitialLoad && conversationId

  return (
    <div className="flex h-full flex-col relative">
      <div className="flex-1 overflow-hidden">
        {showLoadingState ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg animate-pulse">
              <Beaker className="h-7 w-7 text-white" />
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading conversation...</p>
          </div>
        ) : (
        <AnimatePresence mode="wait" initial={false}>
          {/* Ready State - Clean welcome with input and suggestions */}
          {viewState === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col items-center justify-center px-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-center mb-8"
              >
                <div className="mb-6 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Beaker className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                  Peptide AI
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  Your research companion for peptides, dosing, and protocols.
                </p>
              </motion.div>

              {/* Big Voice Button - Mobile only */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mb-8 sm:hidden"
              >
                <VoiceButton
                  size="large"
                  onTranscription={handleVoiceTranscription}
                />
              </motion.div>

              {/* Text Input - Desktop only in ready state */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="hidden sm:block w-full max-w-2xl mb-6"
              >
                <MessageInput
                  onSend={handleSendMessage}
                  disabled={isLoading}
                  placeholder="Ask about peptide research..."
                />
              </motion.div>

              {/* Quick suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex flex-wrap justify-center gap-2 max-w-xl mb-8"
              >
                {[
                  'What peptides help with healing?',
                  'BPC-157 vs TB-500',
                  'Semaglutide dosing',
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

              {/* Install hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <InstallHint />
              </motion.div>
            </motion.div>
          )}

          {/* Chatting State */}
          {viewState === 'chatting' && (
            <motion.div
              key="chatting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <MessageList
                messages={messages}
                isLoading={isLoading}
                isStreaming={isStreaming}
                streamingContent={streamingContent}
                sources={currentSources}
                disclaimers={currentDisclaimers}
                onAddToStack={handleAddToStack}
                onLearnMore={handleLearnMore}
                detectedMode={detectedMode}
                mentionedPeptides={mentionedPeptides}
                conversationId={activeConversationId}
                journeyPrompt={
                  userContext &&
                  !journeyPromptDismissed &&
                  !isLoading &&
                  !isStreaming &&
                  messages.some(m => m.role === 'assistant') ? (
                    <JourneyPrompt
                      context={userContext}
                      onDismiss={() => setJourneyPromptDismissed(true)}
                    />
                  ) : undefined
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className={`shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 safe-area-bottom ${viewState === 'ready' ? 'hidden' : ''}`}>
        <div className="mx-auto max-w-3xl px-4 pt-3 pb-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {showSignUpPrompt ? (
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
              placeholder="Ask about peptide research..."
            />
          )}
        </div>
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white dark:bg-slate-950"
          >
            <OnboardingFlow
              onComplete={handleOnboardingComplete}
              onSkip={() => setShowOnboarding(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
