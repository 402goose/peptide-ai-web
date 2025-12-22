'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MessageSquare, MoreHorizontal, Trash2, Beaker, FlaskConical, MessageSquarePlus } from 'lucide-react'
import { api } from '@/lib/api'
import type { ConversationSummary } from '@/types'
import { cn } from '@/lib/utils'

interface ConversationSidebarProps {
  onSelect?: () => void
}

export function ConversationSidebar({ onSelect }: ConversationSidebarProps) {
  const router = useRouter()
  const params = useParams()
  const currentId = params?.id as string | undefined

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      loadConversations()
    }
  }, [])

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

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
        <Beaker className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-slate-900 dark:text-white">
          Peptide AI
        </span>
      </div>

      {/* New Chat Button */}
      <div className="p-3 space-y-2">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Research Query
        </Button>
        <Button
          onClick={() => router.push('/journey')}
          className="w-full justify-start gap-2"
          variant="ghost"
        >
          <FlaskConical className="h-4 w-4 text-purple-500" />
          Journey Tracker
        </Button>
        <Button
          onClick={() => router.push('/stacks')}
          className="w-full justify-start gap-2"
          variant="ghost"
        >
          <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M17.5 14v7M14 17.5h7" />
          </svg>
          Stack Builder
        </Button>
        <Button
          onClick={() => router.push('/feedback')}
          className="w-full justify-start gap-2"
          variant="ghost"
        >
          <MessageSquarePlus className="h-4 w-4 text-amber-500" />
          Review Feedback
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No conversations yet.
            <br />
            Start a new research query!
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.conversation_id}
                className={cn(
                  'group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-800',
                  currentId === conversation.conversation_id &&
                    'bg-slate-200 dark:bg-slate-800'
                )}
                onClick={() => handleSelectConversation(conversation.conversation_id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900 dark:text-white">
                    {conversation.title}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {formatDate(conversation.updated_at)}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => handleDeleteConversation(conversation.conversation_id, e as unknown as React.MouseEvent)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800">
        Research platform. Not medical advice.
      </div>
    </div>
  )
}
