'use client'

import { Calendar, Beaker, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ResponseActionsProps {
  mode: string
  peptides: string[]
  conversationId?: string
  className?: string
}

export function ResponseActions({ mode, peptides, conversationId, className = '' }: ResponseActionsProps) {
  // Only show for coach mode or when peptides are mentioned
  if (mode !== 'coach' && peptides.length === 0) {
    return null
  }

  const peptideList = peptides.slice(0, 3).map(p => p.toUpperCase()).join(', ')

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 ${className}`}>
      <span className="text-xs text-slate-400 dark:text-slate-500">
        {mode === 'coach' ? 'Ready to track?' : `Track ${peptideList}?`}
      </span>

      <Link href="/journey">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Calendar className="h-3.5 w-3.5" />
          Start Journey
          <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>

      <Link href="/stack">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Beaker className="h-3.5 w-3.5" />
          Add to Stack
          <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  )
}
