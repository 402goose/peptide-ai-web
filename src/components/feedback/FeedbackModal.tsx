'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, MessageSquare, Lightbulb, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FeedbackItem } from './FeedbackProvider'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  componentName: string
  componentPath: string
  onSubmit: (feedback: FeedbackItem) => void
}

const SYSTEM_PROMPT = `You are a product feedback assistant for Peptide AI. You have COMPLETE awareness of the product and its goals.

## PRODUCT OVERVIEW
Peptide AI is a research platform that helps people:
1. **Research Peptides**: Access scientific information about peptides like BPC-157, Semaglutide, TB-500, etc.
2. **Build Stacks**: Create peptide combinations with synergy detection, conflict warnings, dosing protocols
3. **Track Journeys**: Log doses, daily check-ins (energy, sleep, mood, recovery), track progress over time
4. **Chat with AI**: Ask questions and get research-backed answers with citations

## KEY FEATURES
- **Stack Builder**: Goal-based selection (Fat Loss, Healing, Cognitive, etc.), smart recommendations, synergy/conflict detection, shareable stacks
- **Journey Tracker**: Create journeys with peptide stacks, log doses with timing/route/site, daily health check-ins
- **Chat Interface**: Research questions with RAG-powered responses, source citations, follow-up suggestions
- **Viral Sharing**: Share stacks with friends who see a teaser and can sign up

## USER PERSONAS
- Biohackers researching peptides for personal optimization
- Athletes looking for recovery/performance compounds
- People on weight loss journeys (Semaglutide/Tirzepatide users)
- Researchers wanting quick access to peptide literature

## YOUR JOB
When a user gives feedback about component "{componentName}":
1. Ask clarifying questions to deeply understand their experience
2. Understand WHY they feel this way - their goals, frustrations, use case
3. Connect their feedback to product goals and user needs
4. After 2-3 exchanges, let them know you have enough to submit

Be conversational and curious. Ask one question at a time. Focus on:
- What specific interaction triggered this feedback
- What they were trying to accomplish
- How important this is to their workflow
- Any specific ideas for improvement

Keep responses short. When ready, tell them you'll submit the feedback.`

const SUMMARY_PROMPT = `You are analyzing feedback for Peptide AI, a peptide research platform with Stack Builder, Journey Tracker, and Chat features.

Component: "{component}" (path: {path})

Conversation:
{conversation}

Create a structured JSON response (no markdown, just valid JSON):
{
  "summary": "Clear 1-2 sentence summary of what the user wants/needs",
  "productPrompt": "Detailed implementation prompt for a developer. Include:\n- Specific component/file to modify\n- Exact UI/UX changes needed\n- Technical requirements\n- User flow changes\n- Any data model updates\nBe specific enough that a developer could implement this.",
  "insights": ["Key insight about user need", "Pain point discovered", "Opportunity identified"],
  "priority": "low|medium|high - based on: bug severity, user impact, alignment with product goals",
  "category": "bug|feature|ux|content|other"
}

Consider the product context:
- Stack Builder: goal-based peptide selection, synergy detection, sharing
- Journey Tracker: dose logging, daily check-ins, progress tracking
- Chat: research questions with citations
- Users: biohackers, athletes, weight loss, researchers`

export function FeedbackModal({
  isOpen,
  onClose,
  componentName,
  componentPath,
  onSubmit,
}: FeedbackModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start the conversation
      setMessages([{
        role: 'assistant',
        content: `Hi! I see you have feedback about the **${componentName}**. I'd love to understand your thoughts. What would you like to share? Is it a bug, a feature idea, or general feedback?`
      }])
    }
  }, [isOpen, componentName, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Call your API to get LLM response
      const response = await fetch('/api/feedback-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          systemPrompt: SYSTEM_PROMPT,
          componentName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])

      // Check if the conversation seems complete (after 3+ exchanges)
      if (messages.length >= 4 && data.response.toLowerCase().includes('submit')) {
        setIsComplete(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Could you try again?"
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Get the structured summary from LLM
      const conversationText = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')

      const response = await fetch('/api/feedback-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: SUMMARY_PROMPT
              .replace('{component}', componentName)
              .replace('{path}', componentPath)
              .replace('{conversation}', conversationText)
          }],
          systemPrompt: 'You are a helpful assistant that outputs valid JSON. Do not include markdown formatting.',
        }),
      })

      let summary = {
        summary: 'User feedback collected',
        productPrompt: conversationText,
        insights: ['Feedback collected'],
        priority: 'medium' as const,
        category: 'other' as const,
      }

      if (response.ok) {
        const data = await response.json()
        try {
          const parsed = JSON.parse(data.response)
          summary = { ...summary, ...parsed }
        } catch {
          // Use default if parsing fails
        }
      }

      const feedbackItem: FeedbackItem = {
        id: `feedback-${Date.now()}`,
        componentName,
        componentPath,
        timestamp: new Date().toISOString(),
        conversation: messages,
        summary: summary.summary,
        productPrompt: summary.productPrompt,
        insights: summary.insights,
        priority: summary.priority,
        category: summary.category,
        status: 'new',
        userContext: {
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          timestamp: new Date().toISOString(),
        },
      }

      onSubmit(feedbackItem)
      handleClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setMessages([])
    setInput('')
    setIsComplete(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Share Feedback</h3>
              <p className="text-xs text-slate-500">{componentName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {isComplete ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <Lightbulb className="h-5 w-5" />
                <span className="text-sm">Ready to submit your feedback!</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsComplete(false)}
                >
                  Add More
                </Button>
                <Button
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Submit Feedback
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type your feedback..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {messages.length >= 2 && !isComplete && (
            <button
              onClick={() => setIsComplete(true)}
              className="w-full mt-2 text-sm text-purple-500 hover:text-purple-600"
            >
              I&apos;m done, submit feedback
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
