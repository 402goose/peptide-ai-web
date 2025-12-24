'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Beaker, Search, BookOpen, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

const THINKING_STEPS = [
  { icon: Search, text: 'Searching research literature', delay: 0 },
  { icon: BookOpen, text: 'Analyzing relevant studies', delay: 2500 },
  { icon: FlaskConical, text: 'Synthesizing findings', delay: 5000 },
]

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    THINKING_STEPS.forEach((step, index) => {
      if (index > 0) {
        const timer = setTimeout(() => {
          setCurrentStep(index)
        }, step.delay)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [])

  const CurrentIcon = THINKING_STEPS[currentStep].icon
  const currentText = THINKING_STEPS[currentStep].text

  return (
    <motion.div
      className={cn('mb-4 flex gap-3', className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Avatar with pulse ring */}
      <div className="relative">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300 shadow-sm">
          <Beaker className="h-4 w-4" />
        </div>
        {/* Subtle pulse ring */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
      </div>

      {/* Message bubble */}
      <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <CurrentIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">{currentText}</span>
            </motion.div>
          </AnimatePresence>

          {/* Animated dots */}
          <div className="flex gap-1 ml-1">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-blue-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-blue-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-blue-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
