'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, X, Syringe, Target, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { OnboardingContext } from './OnboardingFlow'

// Journey types (matching Journey page)
interface LocalJourney {
  id: string
  title: string
  primaryPeptide: string
  additionalPeptides: string[]
  status: 'planning' | 'active' | 'paused' | 'completed' | 'discontinued'
  startDate?: string
  goals: string
  doseLogs: any[]
  checkIns: any[]
  createdAt: string
  updatedAt: string
}

const JOURNEY_STORAGE_KEY = 'peptide-ai-journeys'

function loadJourneys(): LocalJourney[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(JOURNEY_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveJourneys(journeys: LocalJourney[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(journeys))
}

interface JourneyPromptProps {
  context: OnboardingContext
  onDismiss: () => void
}

export function JourneyPrompt({ context, onDismiss }: JourneyPromptProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isCreated, setIsCreated] = useState(false)
  const [createdJourneyId, setCreatedJourneyId] = useState<string | null>(null)

  const handleStartJourney = async () => {
    setIsCreating(true)

    // Get primary peptide and goals info
    const primaryPeptide = context.goals?.[0]?.peptides?.[0] || context.peptideSuggestions?.[0] || 'Unknown'
    const primaryGoalLabel = context.goals?.[0]?.label || 'Peptide Research'

    // Format goals for the journey notes
    const goalsText = context.goals
      ?.map(g => `${g.label} (Priority ${g.priority})`)
      .join(', ') || ''

    // Create the journey
    const journey: LocalJourney = {
      id: `journey-${Date.now()}`,
      title: `${primaryGoalLabel} Journey`,
      primaryPeptide: primaryPeptide,
      additionalPeptides: context.peptideSuggestions?.slice(1, 4) || [],
      status: 'planning',
      goals: `Goals: ${goalsText}\nExperience: ${context.experienceLevel || 'Not specified'}`,
      doseLogs: [],
      checkIns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to localStorage
    const existingJourneys = loadJourneys()
    saveJourneys([...existingJourneys, journey])

    // Show success state
    setCreatedJourneyId(journey.id)
    setIsCreating(false)
    setIsCreated(true)

    // Auto-dismiss after a few seconds
    setTimeout(() => {
      onDismiss()
    }, 5000)
  }

  // Get the primary peptide recommendation
  const primaryPeptide = context.goals?.[0]?.peptides?.[0] || context.peptideSuggestions?.[0]
  const secondaryPeptides = context.peptideSuggestions?.slice(1, 3) || []

  // Success state - journey created
  if (isCreated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mx-auto max-w-2xl mt-6 mb-4"
      >
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800 p-5 shadow-sm">
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Journey started!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Continue chatting to refine your plan
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Your journey has been created with <span className="font-medium text-green-700 dark:text-green-400">{primaryPeptide}</span> as your primary peptide.
            Keep asking questions to learn more about dosing, timing, and what to expect.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/journey" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                View Journey Tracker
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Continue Chat
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

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
