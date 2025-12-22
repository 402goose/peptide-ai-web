'use client'

import { useState, ReactNode } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { useFeedback } from './FeedbackProvider'

interface FeedbackableProps {
  children: ReactNode
  name: string
  path?: string
  className?: string
}

export function Feedbackable({ children, name, path, className = '' }: FeedbackableProps) {
  const { isEnabled, openFeedback } = useFeedback()
  const [isHovered, setIsHovered] = useState(false)

  if (!isEnabled) {
    return <>{children}</>
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Feedback button - appears on hover */}
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            openFeedback(name, path || name)
          }}
          className="absolute top-1 right-1 z-30 p-1.5 rounded-lg bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-all opacity-90 hover:opacity-100"
          title={`Give feedback on ${name}`}
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      )}

      {/* Subtle border on hover to show feedbackable area */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-purple-300 dark:border-purple-700 rounded-lg pointer-events-none opacity-50" />
      )}
    </div>
  )
}
