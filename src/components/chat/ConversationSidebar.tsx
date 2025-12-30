'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MessageSquare, MoreHorizontal, Trash2, Beaker, FlaskConical, Pencil, Check, X, Calculator, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import type { ConversationSummary } from '@/types'
import { cn } from '@/lib/utils'
import { AuthPromptModal, type AuthFeature } from '@/components/auth/AuthPromptModal'
import { haptic } from '@/lib/haptics'

interface ConversationSidebarProps {
  onSelect?: () => void
}

export function ConversationSidebar({ onSelect }: ConversationSidebarProps) {
  const router = useRouter()
  const params = useParams()
  const { user, isLoaded } = useUser()
  const currentId = params?.id as string | undefined

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; feature: AuthFeature; path: string } | null>(null)

  const handleFeatureNavigation = (feature: AuthFeature, path: string) => {
    haptic('light')
    // If user is logged in, navigate directly
    if (isLoaded && user) {
      router.push(path)
      onSelect?.()
    } else {
      // Show auth prompt modal
      setAuthModal({ isOpen: true, feature, path })
    }
  }

  useEffect(() => {
    // Fetch on client side and refresh when URL changes (new conversation created)
    if (typeof window !== 'undefined') {
      loadConversations()
    }
  }, [currentId]) // Re-fetch when conversation ID changes

  async function loadConversations() {
    try {
      const data = await api.getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleNewChat() {
    router.push('/chat')
    onSelect?.()
  }

  function handleSelectConversation(id: string) {
    router.push(`/chat/c/${id}`)
    onSelect?.()
  }

  async function handleDeleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await api.deleteConversation(id)
      setConversations(prev => prev.filter(c => c.conversation_id !== id))
      if (currentId === id) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  function handleStartRename(id: string, currentTitle: string, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingId(id)
    setEditTitle(currentTitle)
  }

  async function handleSaveRename(id: string) {
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }

    try {
      await api.updateConversation(id, { title: editTitle.trim() })
      setConversations(prev =>
        prev.map(c =>
          c.conversation_id === id ? { ...c, title: editTitle.trim() } : c
        )
      )
    } catch (error) {
      console.error('Failed to rename conversation:', error)
    } finally {
      setEditingId(null)
    }
  }

  function handleCancelRename() {
    setEditingId(null)
    setEditTitle('')
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    // Handle negative days (future dates due to timezone issues)
    if (days < 0) return 'Today'
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
        <Beaker className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-slate-900 dark:text-white">
          Peptide AI
        </span>
      </div>

      {/* New Chat Button */}
      <div className="p-2 space-y-0.5">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 h-8 text-sm"
          variant="outline"
        >
          <Plus className="h-3.5 w-3.5" />
          New Research Query
        </Button>
        <Button
          onClick={() => handleFeatureNavigation('journey', '/journey')}
          className="w-full justify-start gap-2 h-8 text-sm"
          variant="ghost"
        >
          <FlaskConical className="h-3.5 w-3.5 text-purple-500" />
          Journey Tracker
        </Button>
        <Button
          onClick={() => handleFeatureNavigation('stack', '/stacks')}
          className="w-full justify-start gap-2 h-8 text-sm"
          variant="ghost"
        >
          <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M17.5 14v7M14 17.5h7" />
          </svg>
          Stack Builder
        </Button>

        {/* Tools Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">Tools</span>
        </div>
        <Button
          onClick={() => handleFeatureNavigation('calculator', '/tools/calculator')}
          className="w-full justify-start gap-2 h-8 text-sm"
          variant="ghost"
        >
          <Calculator className="h-3.5 w-3.5 text-blue-500" />
          Dose Calculator
        </Button>
        <Button
          onClick={() => handleFeatureNavigation('symptoms', '/tools/symptoms')}
          className="w-full justify-start gap-2 h-8 text-sm"
          variant="ghost"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Symptom Guide
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 min-h-0 px-2">
        {loading ? (
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">
            No conversations yet.
            <br />
            Start a new research query!
          </div>
        ) : (
          <div className="space-y-0.5 pb-2">
            {conversations.map((conversation) => {
              const isEditing = editingId === conversation.conversation_id

              return (
                <div
                  key={conversation.conversation_id}
                  className={cn(
                    'group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-800',
                    currentId === conversation.conversation_id &&
                      'bg-slate-200 dark:bg-slate-800'
                  )}
                  onClick={() => !isEditing && handleSelectConversation(conversation.conversation_id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(conversation.conversation_id)
                            if (e.key === 'Escape') handleCancelRename()
                          }}
                          className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 text-green-600 hover:text-green-700"
                          onClick={() => handleSaveRename(conversation.conversation_id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 text-slate-500 hover:text-slate-700"
                          onClick={handleCancelRename}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="truncate text-[13px] font-medium text-slate-900 dark:text-white leading-tight">
                          {conversation.title}
                        </div>
                        <div className="truncate text-[11px] text-slate-500 leading-tight">
                          {formatDate(conversation.updated_at)}
                        </div>
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleStartRename(conversation.conversation_id, conversation.title, e as unknown as React.MouseEvent)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => handleDeleteConversation(conversation.conversation_id, e as unknown as React.MouseEvent)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-200 px-2 py-2 text-[11px] text-slate-500 dark:border-slate-800">
        Research platform. Not medical advice.
      </div>

      {/* Auth Prompt Modal */}
      {authModal && (
        <AuthPromptModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal(null)}
          feature={authModal.feature}
          targetPath={authModal.path}
          onContinue={() => {
            router.push(authModal.path)
            onSelect?.()
          }}
        />
      )}
    </div>
  )
}
