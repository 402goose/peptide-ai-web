'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { FeedbackModal } from './FeedbackModal'

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
    screenSize: string
    timestamp: string
  }
}

interface FeedbackContextType {
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
  openFeedback: (componentName: string, componentPath: string) => void
  feedbackItems: FeedbackItem[]
  addFeedback: (feedback: FeedbackItem) => void
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

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentComponent, setCurrentComponent] = useState({ name: '', path: '' })
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() => loadFeedback())

  const openFeedback = useCallback((componentName: string, componentPath: string) => {
    setCurrentComponent({ name: componentName, path: componentPath })
    setIsModalOpen(true)
  }, [])

  const addFeedback = useCallback((feedback: FeedbackItem) => {
    setFeedbackItems(prev => {
      const updated = [feedback, ...prev]
      saveFeedback(updated)
      return updated
    })
  }, [])

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

      {/* Floating feedback toggle */}
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg transition-all ${
          isEnabled
            ? 'bg-purple-500 text-white hover:bg-purple-600'
            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
        }`}
        title={isEnabled ? 'Disable feedback mode' : 'Enable feedback mode'}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>
    </FeedbackContext.Provider>
  )
}

export type { FeedbackItem }
