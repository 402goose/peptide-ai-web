'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Rocket, X, Syringe, Target, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { OnboardingContext } from './OnboardingFlow'

interface JourneyPromptProps {
  context: OnboardingContext
  onDismiss: () => void
}

export function JourneyPrompt({ context, onDismiss }: JourneyPromptProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleStartJourney = async () => {
    setIsCreating(true)

    // For now, navigate to journey page with context in URL params
    // Later we can create the journey via API and redirect to the specific journey
    const params = new URLSearchParams()

    // Pass the primary peptide (first one from highest priority goal)
    if (context.goals?.[0]?.peptides?.[0]) {
      params.set('peptide', context.goals[0].peptides[0])
    }

    // Pass goals as JSON
    if (context.goals) {
      params.set('goals', JSON.stringify(context.goals.map(g => ({
        category: g.id,
        label: g.label,
        priority: g.priority,
      }))))
    }

    // Pass experience level
    if (context.experienceLevel) {
      params.set('experience', context.experienceLevel)
    }

    router.push(`/journey?${params.toString()}`)
  }

  // Get the primary peptide recommendation
  const primaryPeptide = context.goals?.[0]?.peptides?.[0] || context.peptideSuggestions?.[0]
  const secondaryPeptides = context.peptideSuggestions?.slice(1, 3) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-2xl mt-6 mb-4"
    >
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 shadow-sm">
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Ready to track your journey?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Log doses, track progress, and see what works
            </p>
          </div>
        </div>

        {/* Goals summary */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Your Goals
          </p>
          <div className="flex flex-wrap gap-2">
            {context.goals?.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                  {goal.priority}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {goal.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended peptides */}
        {primaryPeptide && (
          <div className="space-y-2 mb-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Recommended Peptides
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <Syringe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {primaryPeptide}
                </span>
              </div>
              {secondaryPeptides.map((peptide) => (
                <span
                  key={peptide}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400"
                >
                  {peptide}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleStartJourney}
            disabled={isCreating}
            className="flex-1 gap-2"
          >
            {isCreating ? (
              <>Creating...</>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Start Tracking Journey
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
