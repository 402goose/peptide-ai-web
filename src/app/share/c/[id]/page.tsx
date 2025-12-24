'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Beaker, MessageSquare, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer'
import { api } from '@/lib/api'

interface SharedMessage {
  role: string
  content: string
}

interface SharedConversation {
  share_id: string
  title: string
  messages: SharedMessage[]
  created_at: string
  shared_at: string
}

export default function SharedConversationPage() {
  const params = useParams()
  const shareId = params?.id as string

  const [conversation, setConversation] = useState<SharedConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConversation() {
      if (!shareId) return

      try {
        const data = await api.getSharedConversation(shareId)
        setConversation(data)
      } catch (err) {
        console.error('Failed to load shared conversation:', err)
        setError('Conversation not found')
      } finally {
        setLoading(false)
      }
    }

    loadConversation()
  }, [shareId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Beaker className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">Peptide AI</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Beaker className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              Conversation not found
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
              This shared conversation may have been removed or the link is invalid.
            </p>
            <Link href="/chat">
              <Button className="gap-2">
                Start a new conversation <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shrink-0">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Beaker className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Peptide AI</span>
          </Link>
          <Link href="/chat">
            <Button size="sm" className="gap-2">
              Try Peptide AI <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Title */}
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Shared conversation
            </p>
          </div>

          {/* Messages */}
          <div className="space-y-6">
            {conversation.messages.map((message, index) => (
              <div key={index}>
                {message.role === 'user' ? (
                  // User message - bubble on right
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/10 px-4 py-3">
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Assistant message - markdown rendered
                  <div className="text-slate-900 dark:text-slate-100">
                    <MarkdownRenderer content={message.content} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Continue the conversation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Start your own peptide research journey with our AI assistant
            </p>
            <Link href="/chat">
              <Button className="gap-2">
                Start Researching <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <footer className="mt-8 pb-8 text-center text-xs text-slate-400">
            <p>
              This is a shared conversation from Peptide AI. The information provided is for research purposes only
              and should not be considered medical advice.
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
