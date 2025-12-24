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
        className="mb-6 flex justify-center px-4"
        initial={skipAnimation ? "visible" : "hidden"}
        animate="visible"
        variants={messageVariants}
      >
        <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/50 shadow-sm">
          {/* Goal pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-800/50">
            <Target className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {message.metadata.goal}
            </span>
          </div>
          {/* Condition pills */}
          {message.metadata.conditions && message.metadata.conditions.length > 0 && (
            message.metadata.conditions.map((condition: string, i: number) => (
              <span key={i} className="px-3 py-1 text-xs rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {condition}
              </span>
            ))
          )}
          {/* Experience pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-800/50">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span className="text-xs text-indigo-600 dark:text-indigo-300">
              {EXPERIENCE_LABELS[message.metadata.experience || 'new'] || message.metadata.experience}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  // User messages - bubble style on right
  if (isUser) {
    return (
      <motion.div
        className="mb-6 flex justify-end"
        initial={skipAnimation ? "visible" : "hidden"}
        animate="visible"
        variants={messageVariants}
        data-testid="user-message"
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/10 px-4 py-3">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  // AI messages - clean left-aligned text (ChatGPT style)
  return (
    <motion.div
      className="mb-6"
      initial={skipAnimation ? "visible" : "hidden"}
      animate="visible"
      variants={messageVariants}
      data-testid="assistant-message"
      data-streaming={isStreaming ? 'true' : undefined}
    >
      <div className="text-slate-900 dark:text-slate-100 overflow-hidden">
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
      </div>
    </motion.div>
  )
}
