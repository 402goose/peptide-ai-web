'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Beaker, Heart, Brain, Zap, Scale, Dumbbell,
  Shield, Sparkles, ArrowRight, Check, Activity,
  Pill, FlaskConical, ChevronRight, MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingFlowProps {
  onComplete: (query: string, context: OnboardingContext) => void
  onSkip: () => void
}

export interface OnboardingContext {
  primaryGoal: string
  primaryGoalLabel?: string
  conditions: string[]
  conditionLabels?: string[]
  experienceLevel: string
  peptideSuggestions?: string[]
}

const GOALS = [
  {
    id: 'healing',
    icon: Heart,
    label: 'Healing & Recovery',
    description: 'Injury repair, tissue regeneration, post-surgery',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-900',
    peptides: ['BPC-157', 'TB-500', 'GHK-Cu'],
  },
  {
    id: 'weight',
    icon: Scale,
    label: 'Weight Management',
    description: 'Fat loss, appetite control, metabolic health',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-900',
    peptides: ['Semaglutide', 'Tirzepatide', 'AOD-9604'],
  },
  {
    id: 'cognitive',
    icon: Brain,
    label: 'Cognitive Enhancement',
    description: 'Focus, memory, neuroprotection',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-900',
    peptides: ['Semax', 'Selank', 'Dihexa'],
  },
  {
    id: 'performance',
    icon: Dumbbell,
    label: 'Performance & Muscle',
    description: 'Strength, endurance, muscle growth',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-900',
    peptides: ['CJC-1295', 'Ipamorelin', 'IGF-1'],
  },
  {
    id: 'immune',
    icon: Shield,
    label: 'Immune Support',
    description: 'Immune modulation, cancer support, recovery',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-900',
    peptides: ['Thymosin Alpha-1', 'LL-37', 'BPC-157'],
  },
  {
    id: 'antiaging',
    icon: Sparkles,
    label: 'Anti-Aging & Longevity',
    description: 'Skin, telomeres, cellular health',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-900',
    peptides: ['Epitalon', 'GHK-Cu', 'MOTS-c'],
  },
]

const CONDITIONS = {
  healing: [
    { id: 'tendon', label: 'Tendon/Ligament Injury', icon: Activity },
    { id: 'surgery', label: 'Post-Surgery Recovery', icon: Heart },
    { id: 'chronic', label: 'Chronic Pain', icon: Zap },
    { id: 'gut', label: 'Gut Health Issues', icon: FlaskConical },
  ],
  weight: [
    { id: 'obesity', label: 'Significant Weight Loss', icon: Scale },
    { id: 'stubborn', label: 'Stubborn Fat', icon: Dumbbell },
    { id: 'appetite', label: 'Appetite Control', icon: Pill },
    { id: 'metabolic', label: 'Metabolic Health', icon: Activity },
  ],
  cognitive: [
    { id: 'focus', label: 'Focus & Concentration', icon: Brain },
    { id: 'memory', label: 'Memory Enhancement', icon: Sparkles },
    { id: 'anxiety', label: 'Anxiety Support', icon: Heart },
    { id: 'neuroprotection', label: 'Neuroprotection', icon: Shield },
  ],
  performance: [
    { id: 'muscle', label: 'Muscle Growth', icon: Dumbbell },
    { id: 'recovery', label: 'Workout Recovery', icon: Activity },
    { id: 'endurance', label: 'Endurance', icon: Zap },
    { id: 'gh', label: 'Growth Hormone Optimization', icon: FlaskConical },
  ],
  immune: [
    { id: 'cancer', label: 'Cancer Support', icon: Shield },
    { id: 'autoimmune', label: 'Autoimmune Conditions', icon: Activity },
    { id: 'infections', label: 'Frequent Infections', icon: FlaskConical },
    { id: 'inflammation', label: 'Chronic Inflammation', icon: Zap },
  ],
  antiaging: [
    { id: 'skin', label: 'Skin & Hair', icon: Sparkles },
    { id: 'energy', label: 'Energy & Vitality', icon: Zap },
    { id: 'sleep', label: 'Sleep Quality', icon: Heart },
    { id: 'longevity', label: 'Cellular Health', icon: FlaskConical },
  ],
}

const EXPERIENCE_LEVELS = [
  { id: 'new', label: 'Brand New', description: 'Never used peptides before' },
  { id: 'some', label: 'Some Experience', description: 'Tried 1-2 peptides' },
  { id: 'experienced', label: 'Experienced', description: 'Multiple peptides/cycles' },
]

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [step, setStep] = useState<'goals' | 'conditions' | 'experience'>('goals')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null)

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    )
  }

  const handleGoalsNext = () => {
    if (selectedGoals.length > 0) {
      setSelectedConditions([])
      setStep('conditions')
    }
  }

  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(c => c !== conditionId)
        : [...prev, conditionId]
    )
  }

  const handleConditionsNext = () => {
    setStep('experience')
  }

  const handleExperienceSelect = (level: string) => {
    setExperienceLevel(level)

    // Get all selected goals data
    const selectedGoalData = GOALS.filter(g => selectedGoals.includes(g.id))
    const goalLabels = selectedGoalData.map(g => g.label)

    // Get condition labels from all selected goals
    const conditionLabels = selectedConditions.map(c => {
      for (const goalId of selectedGoals) {
        const condList = CONDITIONS[goalId as keyof typeof CONDITIONS]
        const found = condList?.find(cond => cond.id === c)
        if (found) return found.label
      }
      return c
    })

    // Collect peptides from all selected goals
    const allPeptides = [...new Set(selectedGoalData.flatMap(g => g.peptides))]

    // Create context object with all the details
    const context: OnboardingContext = {
      primaryGoal: selectedGoals.join(','),
      primaryGoalLabel: goalLabels.join(' & '),
      conditions: selectedConditions,
      conditionLabels,
      experienceLevel: level,
      peptideSuggestions: allPeptides,
    }

    // The query is minimal - just triggers the conversation
    // The real context is passed separately and used by the API
    onComplete('START_GUIDED_JOURNEY', context)
  }

  // Get conditions from all selected goals
  const currentConditions = selectedGoals.flatMap(goalId => {
    const conditions = CONDITIONS[goalId as keyof typeof CONDITIONS] || []
    return conditions.map(c => ({ ...c, goalId }))
  })

  return (
    <div className="flex flex-1 flex-col items-center justify-start px-4 py-4 sm:py-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-8 text-center">
        <div className="mb-2 sm:mb-4 flex justify-center">
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Beaker className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
          </div>
        </div>
        <h1 className="mb-1 sm:mb-2 text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
          {step === 'goals' && "What are your goals?"}
          {step === 'conditions' && "Tell us more about your needs"}
          {step === 'experience' && "What's your experience level?"}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
          {step === 'goals' && "Select one or more goals (scroll to see all)"}
          {step === 'conditions' && "Select any that apply to get personalized recommendations"}
          {step === 'experience' && "This helps us tailor the information to your knowledge level"}
        </p>
      </div>

      {/* Progress Indicator with Labels */}
      <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-4 sm:mb-8">
        {[
          { id: 'goals', label: 'Goals', num: 1 },
          { id: 'conditions', label: 'Details', num: 2 },
          { id: 'experience', label: 'Experience', num: 3 },
        ].map((s, i, arr) => {
          const stepIndex = ['goals', 'conditions', 'experience'].indexOf(step)
          const isActive = step === s.id
          const isCompleted = stepIndex > i

          return (
            <div key={s.id} className="flex items-center">
              <div className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-300",
                isActive ? "bg-blue-100 dark:bg-blue-900/50" : "",
              )}>
                <div className={cn(
                  "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-medium transition-all duration-300",
                  isCompleted ? "bg-blue-500 text-white" :
                  isActive ? "bg-blue-500 text-white" :
                  "bg-slate-200 dark:bg-slate-700 text-slate-500"
                )}>
                  {isCompleted ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : s.num}
                </div>
                <span className={cn(
                  "text-xs sm:text-sm font-medium transition-colors duration-300 hidden sm:inline",
                  isActive ? "text-blue-600 dark:text-blue-400" :
                  isCompleted ? "text-slate-600 dark:text-slate-400" :
                  "text-slate-400 dark:text-slate-500"
                )}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={cn(
                  "w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1 transition-colors duration-300",
                  stepIndex > i ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      {step === 'goals' && (
        <div className="w-full max-w-3xl px-2">
          {/* Scrollable goals grid */}
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pb-20">
            {GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id)
              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={cn(
                    "group flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all relative",
                    isSelected
                      ? `${goal.bgColor} ${goal.borderColor} ring-2 ring-blue-500 ring-offset-2`
                      : `${goal.bgColor} ${goal.borderColor} hover:shadow-md hover:scale-[1.02]`
                  )}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", goal.bgColor)}>
                    <goal.icon className={cn("h-4 w-4", goal.color)} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 text-sm sm:text-base pr-6">
                      {goal.label}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {goal.description}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {goal.peptides.slice(0, 2).map(p => (
                      <span key={p} className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-slate-600 dark:text-slate-300">
                        {p}
                      </span>
                    ))}
                    {goal.peptides.length > 2 && (
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-slate-500 dark:text-slate-400">
                        +{goal.peptides.length - 2}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Floating Continue button - always visible when goals selected */}
          {selectedGoals.length > 0 && (
            <motion.div
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleGoalsNext}
                className="gap-2 shadow-lg shadow-blue-500/25 px-6"
                size="lg"
              >
                Continue with {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {step === 'conditions' && (
        <div className="w-full max-w-2xl px-2">
          {/* Show selected goals */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {selectedGoals.map(goalId => {
              const goal = GOALS.find(g => g.id === goalId)
              if (!goal) return null
              return (
                <span key={goalId} className={cn("text-xs px-3 py-1 rounded-full", goal.bgColor, goal.color)}>
                  {goal.label}
                </span>
              )
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {currentConditions.map((condition) => {
              const goalData = GOALS.find(g => g.id === condition.goalId)
              return (
                <button
                  key={`${condition.goalId}-${condition.id}`}
                  onClick={() => handleConditionToggle(condition.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                    selectedConditions.includes(condition.id)
                      ? `${goalData?.bgColor} ${goalData?.borderColor}`
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0",
                    selectedConditions.includes(condition.id)
                      ? goalData?.bgColor
                      : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    {selectedConditions.includes(condition.id) ? (
                      <Check className={cn("h-4 w-4", goalData?.color)} />
                    ) : (
                      <condition.icon className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    selectedConditions.includes(condition.id)
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300"
                  )}>
                    {condition.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="ghost" onClick={() => setStep('goals')}>
              Back
            </Button>
            <Button onClick={handleConditionsNext} className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 'experience' && (
        <div className="w-full max-w-lg">
          <div className="grid gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => handleExperienceSelect(level.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all hover:scale-[1.01]",
                  "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                )}
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {level.label}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {level.description}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="flex justify-start mt-6">
            <Button variant="ghost" onClick={() => setStep('conditions')}>
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Skip Option - More Prominent */}
      <div className="mt-4 sm:mt-8 flex flex-col items-center gap-2 sm:gap-3 pb-4">
        <div className="h-px w-24 sm:w-32 bg-slate-200 dark:bg-slate-700" />
        <button
          onClick={onSkip}
          className="group flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
        >
          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span>Skip and ask directly</span>
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </button>
        <p className="text-[10px] sm:text-xs text-slate-400">
          You can always go through guided setup later
        </p>
      </div>
    </div>
  )
}
