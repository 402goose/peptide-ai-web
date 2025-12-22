'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ExternalLink } from 'lucide-react'
import { SOURCE_COLORS, SOURCE_LABELS, type Source } from '@/types'
import { cn } from '@/lib/utils'

interface CitationBadgeProps {
  index: number
  source?: Source
}

export function CitationBadge({ index, source }: CitationBadgeProps) {
  if (!source) {
    return (
      <span className="mx-0.5 inline-flex items-center justify-center rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
        [{index}]
      </span>
    )
  }

  const color = SOURCE_COLORS[source.type] || SOURCE_COLORS.web
  const label = SOURCE_LABELS[source.type] || 'Source'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'mx-0.5 inline-flex cursor-pointer items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80'
          )}
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          [{index}]
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {label}
            </span>
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <h4 className="font-medium leading-tight text-slate-900 dark:text-white">
            {source.title}
          </h4>
          {source.citation && (
            <p className="text-xs text-slate-500">{source.citation}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
