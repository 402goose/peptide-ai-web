'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

interface FollowUpChipsProps {
  followUps: string[]
  onClick: (question: string) => void
}

export function FollowUpChips({ followUps, onClick }: FollowUpChipsProps) {
  if (followUps.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  }

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400">Related questions</h4>
      </div>
      <div className="flex flex-col gap-2">
        {followUps.map((question, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            onClick={() => onClick(question)}
            className="group flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl
              bg-white dark:bg-slate-800/50
              border border-slate-200 dark:border-slate-700/50
              hover:border-blue-300 dark:hover:border-blue-700
              hover:bg-blue-50/50 dark:hover:bg-blue-900/20
              shadow-sm hover:shadow-md
              transition-all duration-200 text-left"
          >
            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {question}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
