'use client'

import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisclaimerBannerProps {
  disclaimers: string[]
}

export function DisclaimerBanner({ disclaimers }: DisclaimerBannerProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (disclaimers.length === 0) return null

  const primaryDisclaimer = disclaimers[0]
  const additionalDisclaimers = disclaimers.slice(1)

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {primaryDisclaimer}
          </p>

          {additionalDisclaimers.length > 0 && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-auto gap-1 p-0 text-xs text-amber-700 hover:bg-transparent hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
                >
                  {additionalDisclaimers.length} more
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-2 space-y-1">
                  {additionalDisclaimers.map((disclaimer, index) => (
                    <li
                      key={index}
                      className="text-xs text-amber-700 dark:text-amber-300"
                    >
                      {disclaimer}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  )
}
