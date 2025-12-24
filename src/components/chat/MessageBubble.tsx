'use client'

import { User, Beaker, Target, Sparkles } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { StreamingMessage } from './StreamingMessage'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isLast?: boolean
  isStreaming?: boolean
}

// Experience level labels
const EXPERIENCE_LABELS: Record<string, string> = {
  new: 'New to peptides',
  some: 'Some experience',
  experienced: 'Experienced user',
}

export function MessageBubble({ message, isLast, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isOnboardingContext = message.metadata?.type === 'onboarding_context'

  // Special render for onboarding context
  if (isOnboardingContext && message.metadata) {
    return (
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {message.metadata.goal}
            </span>
          </div>
          {message.metadata.conditions && message.metadata.conditions.length > 0 && (
            <>
              <div className="w-px h-4 bg-blue-200 dark:bg-blue-700" />
              <div className="flex items-center gap-1.5">
                {message.metadata.conditions.slice(0, 2).map((condition, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {condition}
                  </span>
                ))}
                {message.metadata.conditions.length > 2 && (
                  <span className="text-xs text-slate-400">+{message.metadata.conditions.length - 2}</span>
                )}
              </div>
            </>
          )}
          <div className="w-px h-4 bg-blue-200 dark:bg-blue-700" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {EXPERIENCE_LABELS[message.metadata.experience || 'new'] || message.metadata.experience}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'mb-4 flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Beaker className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser
            ? 'rounded-br-sm bg-blue-600 text-white'
            : 'rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : isStreaming ? (
          <StreamingMessage
            content={message.content}
            isStreaming={isStreaming}
            sources={message.sources}
          />
        ) : (
          <MarkdownRenderer
            content={message.content}
            sources={message.sources}
          />
        )}
      </div>
    </div>
  )
}
