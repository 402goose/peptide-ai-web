import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Beaker, MessageSquare, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SharedMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SharedConversation {
  share_id: string
  title: string
  messages: SharedMessage[]
  created_at: string
  shared_at: string
}

async function getSharedConversation(shareId: string): Promise<SharedConversation | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  if (!apiBase) return null

  try {
    const response = await fetch(`${apiBase}/api/v1/share/${shareId}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch shared conversation')
    }

    return response.json()
  } catch (error) {
    console.error('Failed to fetch shared conversation:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const conversation = await getSharedConversation(id)

  if (!conversation) {
    return {
      title: 'Conversation Not Found | Peptide AI',
    }
  }

  // Get first user message for description
  const firstUserMessage = conversation.messages.find(m => m.role === 'user')
  const description = firstUserMessage
    ? firstUserMessage.content.slice(0, 160) + (firstUserMessage.content.length > 160 ? '...' : '')
    : 'A shared peptide research conversation'

  return {
    title: `${conversation.title} | Peptide AI`,
    description,
    openGraph: {
      title: conversation.title,
      description,
      type: 'article',
      siteName: 'Peptide AI',
    },
    twitter: {
      card: 'summary_large_image',
      title: conversation.title,
      description,
    },
  }
}

export default async function SharedConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const conversation = await getSharedConversation(id)

  if (!conversation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
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

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            {conversation.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Shared conversation from Peptide AI
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Beaker className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className={`whitespace-pre-wrap text-sm ${message.role === 'assistant' ? 'text-slate-700 dark:text-slate-300' : ''}`}>
                  {message.content}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
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
        <footer className="mt-8 text-center text-xs text-slate-400">
          <p>
            This is a shared conversation from Peptide AI. The information provided is for research purposes only
            and should not be considered medical advice.
          </p>
        </footer>
      </main>
    </div>
  )
}
