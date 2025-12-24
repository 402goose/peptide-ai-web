'use client'

import { motion } from 'framer-motion'
import { User, Beaker, Target, Sparkles } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isLast?: boolean
  isStreaming?: boolean
  /** Skip entrance animation (for messages that are already visible) */
  skipAnimation?: boolean
}

// Experience level labels
const EXPERIENCE_LABELS: Record<string, string> = {
  new: 'New to peptides',
  some: 'Some experience',
  experienced: 'Experienced user',
}

export function MessageBubble({ message, isLast, isStreaming, skipAnimation = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isOnboardingContext = message.metadata?.type === 'onboarding_context'

  // Animation variants for message entrance
  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 8,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1] as const, // Custom ease for smooth feel
      }
    },
  }

  // Special render for onboarding context
  if (isOnboardingContext && message.metadata) {
    return (
      <motion.div
        className="mb-6 flex justify-center"
        initial={skipAnimation ? "visible" : "hidden"}
        animate="visible"
        variants={messageVariants}
      >
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/50 shadow-sm">
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
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        'mb-4 flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
      initial={skipAnimation ? "visible" : "hidden"}
      animate="visible"
      variants={messageVariants}
      data-testid={isUser ? 'user-message' : 'assistant-message'}
      data-streaming={isStreaming ? 'true' : undefined}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-shadow duration-200',
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300 shadow-sm'
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
          'max-w-[85%] rounded-2xl px-4 py-3 transition-shadow duration-200',
          isUser
            ? 'rounded-br-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/10'
            : 'rounded-bl-sm bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700/50'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        ) : (
          <>
            <MarkdownRenderer
              content={message.content}
              sources={message.sources}
            />
            {/* Streaming cursor indicator */}
            {isStreaming && (
              <span
                className="inline-block w-0.5 h-4 ml-0.5 bg-blue-500 animate-pulse align-middle rounded-full"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
