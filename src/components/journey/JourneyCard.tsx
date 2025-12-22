'use client'

import { Play, Pause, CheckCircle, XCircle, Clock, Pill, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { JourneySummary, JourneyStatus } from '@/types/journey'

interface JourneyCardProps {
  journey: JourneySummary
  onClick?: () => void
  onStart?: () => void
  onPause?: () => void
  onResume?: () => void
}

const STATUS_CONFIG: Record<JourneyStatus, { label: string; color: string; icon: React.ElementType }> = {
  planning: { label: 'Planning', color: 'text-slate-600 bg-slate-100', icon: Clock },
  active: { label: 'Active', color: 'text-green-600 bg-green-100', icon: Play },
  paused: { label: 'Paused', color: 'text-amber-600 bg-amber-100', icon: Pause },
  completed: { label: 'Completed', color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
  discontinued: { label: 'Discontinued', color: 'text-red-600 bg-red-100', icon: XCircle },
}

export function JourneyCard({ journey, onClick, onStart, onPause, onResume }: JourneyCardProps) {
  const config = STATUS_CONFIG[journey.status]
  const StatusIcon = config.icon

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not started'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800',
        onClick && 'cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {journey.title || journey.primary_peptide}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Pill className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {journey.primary_peptide}
            </span>
          </div>
        </div>
        <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', config.color)}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(journey.start_date)}
        </div>
        <div>
          {journey.dose_count} doses logged
        </div>
        {journey.overall_efficacy_rating && (
          <div className="font-medium text-blue-600">
            {journey.overall_efficacy_rating}/10 efficacy
          </div>
        )}
      </div>

      {/* Actions based on status */}
      <div className="flex gap-2">
        {journey.status === 'planning' && onStart && (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onStart() }}>
            <Play className="h-3.5 w-3.5 mr-1" />
            Start Journey
          </Button>
        )}
        {journey.status === 'active' && onPause && (
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onPause() }}>
            <Pause className="h-3.5 w-3.5 mr-1" />
            Pause
          </Button>
        )}
        {journey.status === 'paused' && onResume && (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onResume() }}>
            <Play className="h-3.5 w-3.5 mr-1" />
            Resume
          </Button>
        )}
      </div>
    </div>
  )
}

// Journey list component
interface JourneyListProps {
  journeys: JourneySummary[]
  onJourneyClick?: (journey: JourneySummary) => void
  onStartJourney?: (journeyId: string) => void
  onPauseJourney?: (journeyId: string) => void
  onResumeJourney?: (journeyId: string) => void
  loading?: boolean
}

export function JourneyList({
  journeys,
  onJourneyClick,
  onStartJourney,
  onPauseJourney,
  onResumeJourney,
  loading,
}: JourneyListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (journeys.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No journeys yet.</p>
        <p className="text-sm">Start tracking your peptide research!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {journeys.map((journey) => (
        <JourneyCard
          key={journey.journey_id}
          journey={journey}
          onClick={() => onJourneyClick?.(journey)}
          onStart={() => onStartJourney?.(journey.journey_id)}
          onPause={() => onPauseJourney?.(journey.journey_id)}
          onResume={() => onResumeJourney?.(journey.journey_id)}
        />
      ))}
    </div>
  )
}
