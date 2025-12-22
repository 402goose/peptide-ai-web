'use client'

import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ExternalLink, BookOpen } from 'lucide-react'
import { SOURCE_COLORS, SOURCE_LABELS, type Source } from '@/types'
import { cn } from '@/lib/utils'

interface SourcesPanelProps {
  sources: Source[]
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (sources.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-2 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <BookOpen className="h-4 w-4" />
          <span>{sources.length} sources</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          {sources.map((source, index) => {
            const color = SOURCE_COLORS[source.type] || SOURCE_COLORS.web
            const label = SOURCE_LABELS[source.type] || 'Source'

            return (
              <div
                key={index}
                className="flex items-start gap-3 rounded-md bg-white p-2 dark:bg-slate-800"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <h5 className="mb-1 text-sm font-medium leading-tight text-slate-900 dark:text-white">
                    {source.title}
                  </h5>
                  {source.citation && (
                    <p className="mb-1 text-xs text-slate-500 line-clamp-2">
                      {source.citation}
                    </p>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
