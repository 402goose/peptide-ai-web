'use client'

import { Info, AlertTriangle } from 'lucide-react'

interface DisclaimerBannerProps {
  disclaimers: string[]
}

export function DisclaimerBanner({ disclaimers }: DisclaimerBannerProps) {
  if (disclaimers.length === 0) return null

  // Check if any disclaimer contains a warning indicator
  const hasWarning = disclaimers.some(d => d.includes('⚠️') || d.includes('Banned'))

  // If only one disclaimer, show inline
  if (disclaimers.length === 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Info className="h-3 w-3 shrink-0" />
        <span>{disclaimers[0]}</span>
      </div>
    )
  }

  // Multiple disclaimers - show as a compact list
  return (
    <div className={`mt-2 p-2 rounded-lg text-xs ${
      hasWarning
        ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
        : 'bg-slate-50 dark:bg-slate-800/50'
    }`}>
      <div className="flex items-start gap-1.5">
        {hasWarning ? (
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
        ) : (
          <Info className="h-3 w-3 shrink-0 mt-0.5 text-slate-400" />
        )}
        <div className="space-y-0.5">
          {disclaimers.map((disclaimer, index) => (
            <p
              key={index}
              className={`${
                disclaimer.includes('⚠️') || disclaimer.includes('Banned')
                  ? 'text-amber-700 dark:text-amber-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {disclaimer}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
