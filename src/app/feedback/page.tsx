'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MessageSquare, Lightbulb, AlertCircle, CheckCircle,
  Clock, ChevronDown, ChevronUp, Trash2, Copy, Filter, Bug,
  Sparkles, Layout, FileText, HelpCircle, Eye, EyeOff, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    fullUrl?: string
    screenSize?: string
    deviceType?: string
    userAgent?: string
    language?: string
    timezone?: string
    timestamp?: string
    localTime?: string
    persona_id?: string
    session_num?: number
    satisfaction?: number
  }
  source?: 'local' | 'api'
}

// Convert API snake_case to camelCase
function convertApiFeedback(apiFeedback: any): FeedbackItem {
  return {
    id: apiFeedback.id,
    componentName: apiFeedback.component_name || 'Unknown',
    componentPath: apiFeedback.component_path || '',
    timestamp: apiFeedback.created_at || new Date().toISOString(),
    conversation: apiFeedback.conversation || [],
    summary: apiFeedback.summary || '',
    productPrompt: apiFeedback.product_prompt || '',
    insights: apiFeedback.insights || [],
    priority: apiFeedback.priority || 'medium',
    category: apiFeedback.category || 'other',
    status: apiFeedback.status || 'new',
    userContext: apiFeedback.user_context || { page: '/' },
    source: 'api'
  }
}

const STORAGE_KEY = 'peptide-ai-feedback'

const CATEGORY_CONFIG = {
  bug: { label: 'Bug', icon: Bug, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  feature: { label: 'Feature', icon: Sparkles, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  ux: { label: 'UX', icon: Layout, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  content: { label: 'Content', icon: FileText, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  other: { label: 'Other', icon: HelpCircle, color: 'text-slate-600 bg-slate-100 dark:bg-slate-700' },
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-slate-600 bg-slate-100' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-100' },
  high: { label: 'High', color: 'text-red-600 bg-red-100' },
}

const STATUS_CONFIG = {
  new: { label: 'New', icon: AlertCircle, color: 'text-blue-600 bg-blue-100' },
  reviewed: { label: 'Reviewed', icon: Eye, color: 'text-amber-600 bg-amber-100' },
  implemented: { label: 'Implemented', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  dismissed: { label: 'Dismissed', icon: EyeOff, color: 'text-slate-400 bg-slate-100' },
}

export default function FeedbackPage() {
  const router = useRouter()
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'implemented' | 'dismissed'>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchFeedback = async () => {
    setLoading(true)
    const allItems: FeedbackItem[] = []

    // 1. Load from localStorage (legacy/local items)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const localItems = JSON.parse(saved) as FeedbackItem[]
        localItems.forEach(item => {
          allItems.push({ ...item, source: 'local' })
        })
      } catch (e) {
        console.error('Failed to load local feedback:', e)
      }
    }

    // 2. Fetch from API
    try {
      const response = await fetch('/api/feedback')
      if (response.ok) {
        const apiItems = await response.json()
        apiItems.forEach((item: any) => {
          // Skip if we already have this ID from localStorage
          if (!allItems.find(i => i.id === item.id)) {
            allItems.push(convertApiFeedback(item))
          }
        })
      }
    } catch (e) {
      console.error('Failed to fetch API feedback:', e)
    }

    // Sort by timestamp (newest first)
    allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setFeedbackItems(allItems)
    setLoading(false)
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  const saveFeedback = (items: FeedbackItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    setFeedbackItems(items)
  }

  const updateStatus = (id: string, status: FeedbackItem['status']) => {
    const updated = feedbackItems.map(item =>
      item.id === id ? { ...item, status } : item
    )
    saveFeedback(updated)
  }

  const deleteFeedback = (id: string) => {
    if (!confirm('Delete this feedback?')) return
    const updated = feedbackItems.filter(item => item.id !== id)
    saveFeedback(updated)
  }

  const copyPrompt = async (prompt: string, id: string) => {
    await navigator.clipboard.writeText(prompt)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const filteredItems = feedbackItems.filter(item =>
    filter === 'all' ? true : item.status === filter
  )

  const stats = {
    total: feedbackItems.length,
    new: feedbackItems.filter(i => i.status === 'new').length,
    bugs: feedbackItems.filter(i => i.category === 'bug').length,
    features: feedbackItems.filter(i => i.category === 'feature').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Feedback Review
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchFeedback()}
          disabled={loading}
        >
          <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Feedback</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <div className="text-sm text-blue-600/70">New</div>
          </div>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600">{stats.bugs}</div>
            <div className="text-sm text-red-600/70">Bugs</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600">{stats.features}</div>
            <div className="text-sm text-purple-600/70">Features</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-400" />
          {(['all', 'new', 'reviewed', 'implemented', 'dismissed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === status
                  ? "bg-purple-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Feedback List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No feedback yet</p>
            <p className="text-sm mt-1">Enable feedback mode and click on components to collect feedback</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id
              const CategoryIcon = CATEGORY_CONFIG[item.category].icon

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {item.componentName}
                          </span>
                          <span className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            CATEGORY_CONFIG[item.category].color
                          )}>
                            <CategoryIcon className="h-3 w-3" />
                            {CATEGORY_CONFIG[item.category].label}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            PRIORITY_CONFIG[item.priority].color
                          )}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {item.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          STATUS_CONFIG[item.status].color
                        )}>
                          {STATUS_CONFIG[item.status].label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div>{item.componentPath}</div>
                      {item.userContext?.persona_id && (
                        <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">
                          🤖 {item.userContext.persona_id}
                          {typeof item.userContext.satisfaction === 'number' && ` (${item.userContext.satisfaction.toFixed(1)}/10)`}
                        </span>
                      )}
                      {item.source === 'api' && !item.userContext?.persona_id && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                          API
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-850 space-y-4">
                      {/* Insights */}
                      {item.insights.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Key Insights
                          </h4>
                          <ul className="space-y-1">
                            {item.insights.map((insight, i) => (
                              <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <span className="text-purple-500">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Product Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Implementation Prompt
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyPrompt(item.productPrompt, item.id)}
                          >
                            {copied === item.id ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap">
                          {item.productPrompt}
                        </div>
                      </div>

                      {/* Conversation */}
                      <details className="group">
                        <summary className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-purple-500">
                          View Full Conversation ({item.conversation.length} messages)
                        </summary>
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                          {item.conversation.map((msg, i) => (
                            <div key={i} className={cn(
                              "p-2 rounded-lg text-sm",
                              msg.role === 'user'
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            )}>
                              <span className="font-medium">{msg.role === 'user' ? 'User' : 'AI'}:</span>{' '}
                              {msg.content}
                            </div>
                          ))}
                        </div>
                      </details>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <span className="text-xs text-slate-400 mr-2">Update status:</span>
                        {(['new', 'reviewed', 'implemented', 'dismissed'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => updateStatus(item.id, status)}
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium transition-colors",
                              item.status === status
                                ? "bg-purple-500 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                            )}
                          >
                            {status}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteFeedback(item.id)}
                          className="ml-auto p-1 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
