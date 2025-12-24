'use client'

import { useState, useEffect } from 'react'
import { Beaker, Search, BookOpen, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

const THINKING_STEPS = [
  { icon: Search, text: 'Searching research literature', delay: 0 },
  { icon: BookOpen, text: 'Analyzing relevant studies', delay: 2000 },
  { icon: FlaskConical, text: 'Synthesizing findings', delay: 4000 },
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
    <div className={cn('mb-4 flex gap-3', className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
        <Beaker className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <CurrentIcon className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
          <span className="text-sm text-slate-600 dark:text-slate-400">{currentText}</span>
          <div className="flex gap-1 ml-1">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
