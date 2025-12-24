'use client'

import { Info } from 'lucide-react'

interface DisclaimerBannerProps {
  disclaimers: string[]
}

export function DisclaimerBanner({ disclaimers }: DisclaimerBannerProps) {
  if (disclaimers.length === 0) return null

  // Show only the primary disclaimer in a subtle inline style
  const primaryDisclaimer = disclaimers[0]

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
      <Info className="h-3 w-3 shrink-0" />
      <span>{primaryDisclaimer}</span>
    </div>
  )
}
