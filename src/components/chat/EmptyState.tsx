'use client'

import { Beaker, Search, BookOpen, Shield, FlaskConical, Activity, Pill, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onExampleClick: (query: string) => void
}

const EXAMPLE_QUERIES = [
  {
    icon: FlaskConical,
    label: 'Research',
    query: 'What does the research say about BPC-157 for tendon healing?',
  },
  {
    icon: Activity,
    label: 'Mechanisms',
    query: 'How does TB-500 work at the cellular level?',
  },
  {
    icon: Pill,
    label: 'Safety',
    query: 'What are the known side effects of Semaglutide?',
  },
]

const TRUST_STATS = [
  { value: '1,200+', label: 'Research Papers' },
  { value: 'PubMed', label: 'Verified Sources' },
  { value: '100+', label: 'Peptides Covered' },
]

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Logo and Title */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
        <Beaker className="h-8 w-8 text-white" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Peptide Research Assistant
      </h1>
      <p className="mb-6 max-w-lg text-center text-slate-600 dark:text-slate-400">
        Evidence-based insights from peer-reviewed research and real user experiences. Ask questions about peptides, protocols, and mechanisms.
      </p>

      {/* Trust Stats */}
      <div className="flex items-center gap-6 mb-8 px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        {TRUST_STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-4">
            {i > 0 && <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />}
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Example Queries */}
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3 mb-8">
        {EXAMPLE_QUERIES.map((example) => (
          <Button
            key={example.label}
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
            onClick={() => onExampleClick(example.query)}
          >
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50">
                <example.icon className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="font-medium">{example.label}</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {example.query}
            </span>
          </Button>
        ))}
      </div>

      {/* Trust Signals */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span>Peer-Reviewed Sources</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span>Updated Weekly</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span>Cited References</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="max-w-md text-center text-xs text-slate-400 dark:text-slate-500">
        This is a research platform, not medical advice. Always consult qualified healthcare professionals before making health decisions.
      </p>
    </div>
  )
}
