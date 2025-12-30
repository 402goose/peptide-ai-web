'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { haptic } from '@/lib/haptics'

interface FollowUpChipsProps {
  followUps: string[]
  onClick: (question: string) => void
}

export function FollowUpChips({ followUps, onClick }: FollowUpChipsProps) {
  if (followUps.length === 0) return null

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-1.5">
        <MessageCircle className="h-3 w-3 text-slate-400" />
        <span className="text-xs text-slate-400 dark:text-slate-500">Continue the conversation</span>
      </div>

      {/* Horizontal scrollable container */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {followUps.map((question, index) => (
          <motion.button
            key={index}
            onClick={() => {
              haptic('light')
              onClick(question)
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group flex-shrink-0 flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-full
              bg-slate-100 dark:bg-slate-800
              hover:bg-blue-100 dark:hover:bg-blue-900/40
              border border-transparent hover:border-blue-200 dark:hover:border-blue-800
              transition-all duration-150 text-left max-w-[200px] sm:max-w-[250px] md:max-w-[280px]
              min-h-[44px] sm:min-h-0"
          >
            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate transition-colors">
              {question}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
