'use client'

import { useState } from 'react'
import {
  Target, Search, FlaskConical, Pill, ShoppingCart,
  Activity, Check, ChevronRight, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JourneyProgressProps {
  currentStage: JourneyStage
  completedStages: JourneyStage[]
  goals?: string[]
  selectedPeptides?: string[]
  onStageClick?: (stage: JourneyStage) => void
}

export type JourneyStage =
  | 'goals'
  | 'research'
  | 'peptide_selection'
  | 'protocol'
  | 'sourcing'
  | 'tracking'

interface StageConfig {
  id: JourneyStage
  label: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

const STAGES: StageConfig[] = [
  {
    id: 'goals',
    label: 'Set Goals',
    description: 'Define what you want to achieve',
    icon: Target,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
  {
    id: 'research',
    label: 'Research',
    description: 'Learn about peptides for your goals',
    icon: Search,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
  },
  {
    id: 'peptide_selection',
    label: 'Select Peptides',
    description: 'Choose the right peptides for you',
    icon: FlaskConical,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
  },
  {
    id: 'protocol',
    label: 'Build Protocol',
    description: 'Define dosing, timing, and duration',
    icon: Pill,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
  },
  {
    id: 'sourcing',
    label: 'Source',
    description: 'Get from vetted suppliers',
    icon: ShoppingCart,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
  {
    id: 'tracking',
    label: 'Track Results',
    description: 'Monitor progress and adjust',
    icon: Activity,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500',
  },
]

export function JourneyProgress({
  currentStage,
  completedStages,
  goals,
  selectedPeptides,
  onStageClick,
}: JourneyProgressProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage)

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />

        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-500"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {/* Stage indicators */}
        <div className="relative flex justify-between">
          {STAGES.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.id)
            const isCurrent = stage.id === currentStage
            const isPast = index < currentIndex

            return (
              <button
                key={stage.id}
                onClick={() => onStageClick?.(stage.id)}
                className={cn(
                  "flex flex-col items-center group",
                  onStageClick && "cursor-pointer"
                )}
              >
                {/* Circle indicator */}
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted || isPast
                      ? `${stage.bgColor} border-transparent`
                      : isCurrent
                        ? `bg-white dark:bg-slate-900 ${stage.color} border-current`
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <stage.icon className={cn(
                      "h-5 w-5",
                      isCompleted || isPast ? "text-white" :
                      isCurrent ? stage.color : "text-slate-400"
                    )} />
                  )}

                  {/* Pulse animation for current stage */}
                  {isCurrent && (
                    <span className={cn(
                      "absolute inset-0 rounded-full animate-ping opacity-25",
                      stage.bgColor
                    )} />
                  )}
                </div>

                {/* Label */}
                <span className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  isCurrent ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                )}>
                  {stage.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Current Stage Details */}
      <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-4">
        {STAGES.filter(s => s.id === currentStage).map(stage => (
          <div key={stage.id} className="flex items-start gap-4">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              stage.bgColor
            )}>
              <stage.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {stage.label}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {stage.description}
              </p>

              {/* Stage-specific content */}
              {stage.id === 'goals' && goals && goals.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {goals.map((goal, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {goal}
                    </span>
                  ))}
                </div>
              )}

              {stage.id === 'peptide_selection' && selectedPeptides && selectedPeptides.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedPeptides.map((peptide, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                      {peptide}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        {currentStage !== 'goals' && (
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Sparkles className="h-3 w-3" />
            Refine Goals
          </button>
        )}
        {currentStage === 'research' && (
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors">
            <FlaskConical className="h-3 w-3" />
            Compare Peptides
          </button>
        )}
        {currentStage === 'peptide_selection' && (
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900 transition-colors">
            <Pill className="h-3 w-3" />
            Build Protocol
          </button>
        )}
      </div>
    </div>
  )
}

// Compact version for sidebar
export function JourneyProgressCompact({
  currentStage,
  completedStages,
}: {
  currentStage: JourneyStage
  completedStages: JourneyStage[]
}) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage)
  const currentStageData = STAGES.find(s => s.id === currentStage)

  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {currentStageData && (
          <>
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              currentStageData.bgColor
            )}>
              <currentStageData.icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Your Journey</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {currentStageData.label}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mini progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / STAGES.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
        Step {currentIndex + 1} of {STAGES.length}
      </p>
    </div>
  )
}
