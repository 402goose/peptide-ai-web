'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { FeedbackModal } from './FeedbackModal'
import { haptic } from '@/lib/haptics'

interface FeedbackItem {
  id: string
  componentName: string
  componentPath: string
  timestamp: string
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>
  summary: string
  productPrompt: string
  insights: string[]
  priority: 'low' | 'medium' | 'high'
  category: 'bug' | 'feature' | 'ux' | 'content' | 'other'
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed'
  userContext: {
    page: string
    fullUrl: string
    screenSize: string
    deviceType: string
    userAgent: string
    language: string
    timezone: string
    timestamp: string
    localTime: string
  }
}

interface FeedbackContextType {
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
  openFeedback: (componentName: string, componentPath: string) => void
  feedbackItems: FeedbackItem[]
  addFeedback: (feedback: FeedbackItem) => Promise<{ success: boolean; error?: string }>
  updateFeedbackStatus: (id: string, status: FeedbackItem['status']) => void
}

const FeedbackContext = createContext<FeedbackContextType | null>(null)

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider')
  }
  return context
}

const STORAGE_KEY = 'peptide-ai-feedback'

function loadFeedback(): FeedbackItem[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveFeedback(items: FeedbackItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

async function sendFeedbackToAPI(
  feedback: FeedbackItem,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component_name: feedback.componentName,
        component_path: feedback.componentPath,
        conversation: feedback.conversation,
        summary: feedback.summary,
        product_prompt: feedback.productPrompt,
        insights: feedback.insights,
        priority: feedback.priority,
        category: feedback.category,
        user_context: feedback.userContext,
        user_email: userEmail,
      }),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        // Handle different error formats
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = String(errorData.message)
        } else {
          errorMessage = JSON.stringify(errorData)
        }
      } catch {
        // If JSON parsing fails, try text
        try {
          errorMessage = await response.text() || errorMessage
        } catch {
          // Use default
        }
      }
      console.error('Feedback API error:', response.status, errorMessage)
      return { success: false, error: errorMessage }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send feedback to API:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [isEnabled, setIsEnabled] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentComponent, setCurrentComponent] = useState({ name: '', path: '' })
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() => loadFeedback())

  // Get user's primary email if available
  const userEmail = user?.primaryEmailAddress?.emailAddress

  const openFeedback = useCallback((componentName: string, componentPath: string) => {
    setCurrentComponent({ name: componentName, path: componentPath })
    setIsModalOpen(true)
  }, [])

  const addFeedback = useCallback(async (feedback: FeedbackItem): Promise<{ success: boolean; error?: string }> => {
    // Save locally first (backup)
    setFeedbackItems(prev => {
      const updated = [feedback, ...prev]
      saveFeedback(updated)
      return updated
    })

    // Send to API and wait for result (include user email for follow-up notifications)
    const result = await sendFeedbackToAPI(feedback, userEmail)

    if (result.success) {
      console.log('✅ Feedback saved to server')
    } else {
      console.warn('⚠️ Feedback saved locally but failed to sync to server:', result.error)
    }

    return result
  }, [userEmail])

  const updateFeedbackStatus = useCallback((id: string, status: FeedbackItem['status']) => {
    setFeedbackItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
      saveFeedback(updated)
      return updated
    })
  }, [])

  return (
    <FeedbackContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        openFeedback,
        feedbackItems,
        addFeedback,
        updateFeedbackStatus,
      }}
    >
      {children}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        componentName={currentComponent.name}
        componentPath={currentComponent.path}
        onSubmit={addFeedback}
      />

      {/* Floating feedback button - opens feedback modal */}
      {/* Bottom right, above the chat input area (safe-area + input height) */}
      <button
        onClick={() => {
          haptic('light')
          openFeedback('General Feedback', window.location.pathname)
        }}
        className="fixed right-4 z-40 p-3 rounded-full shadow-lg transition-all bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 active:scale-95"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)'
        }}
        title="Give feedback"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>
    </FeedbackContext.Provider>
  )
}

export type { FeedbackItem }
