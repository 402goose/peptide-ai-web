'use client'

import { Beaker } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="mb-4 flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
        <Beaker className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
        <div className="flex items-center gap-1">
          <span className="text-sm text-slate-500">Searching research literature</span>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
