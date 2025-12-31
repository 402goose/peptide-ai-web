'use client'

import { Search, BookOpen, Shield, FlaskConical, Activity, Pill, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SequenceLogo, SequenceIcon } from '@/components/brand/SequenceLogo'

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
  { value: '1,200+', label: 'Peer-Reviewed Papers' },
  { value: 'PubMed', label: '& arXiv Sourced' },
  { value: '100+', label: 'Peptides Covered' },
]

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Logo Mark */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sequence-gradient shadow-lg">
        <SequenceIcon size={32} className="text-white [&_*]:stroke-white [&_circle]:fill-white" />
      </div>

      {/* Hero Title */}
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        The Research Engine
      </h1>

      {/* Subtitle */}
      <p className="mb-6 max-w-lg text-center text-slate-600 dark:text-slate-400">
        Evidence-based insights from peer-reviewed research. Ask about peptides, protocols, mechanisms, and safety.
      </p>

      {/* Trust Stats */}
      <div className="flex items-center gap-6 mb-8 px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        {TRUST_STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-4">
            {i > 0 && <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />}
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{stat.value}</div>
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
            className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
            onClick={() => onExampleClick(example.query)}
          >
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/20">
                <example.icon className="h-3.5 w-3.5 text-primary" />
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
          <CheckCircle2 className="h-3.5 w-3.5 text-sequence-teal" />
          <span>Peer-Reviewed Sources</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-sequence-teal" />
          <span>Updated Weekly</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-sequence-teal" />
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
