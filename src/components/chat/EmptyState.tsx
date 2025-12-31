'use client'

import { FlaskConical, Activity, Pill, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SequenceIcon } from '@/components/brand/SequenceLogo'

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
      {/* Logo Mark - Larger and more prominent */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-sequence-gradient shadow-xl shadow-indigo-500/20 animate-helix">
        <SequenceIcon size={44} className="text-white [&_*]:stroke-white [&_circle]:fill-white" />
      </div>

      {/* Brand Name */}
      <h1 className="mb-1 text-4xl font-bold tracking-tight text-sequence-gradient">
        Sequence
      </h1>

      {/* Tagline */}
      <p className="mb-6 text-lg font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-sequence-teal" />
        Your Research Engine
        <Sparkles className="h-4 w-4 text-sequence-teal" />
      </p>

      {/* Subtitle */}
      <p className="mb-6 max-w-lg text-center text-slate-500 dark:text-slate-400">
        Evidence-based insights from peer-reviewed research. Ask about peptides, protocols, mechanisms, and safety.
      </p>

      {/* Trust Stats */}
      <div className="flex items-center gap-6 mb-8 px-6 py-3 rounded-xl bg-sequence-gradient-subtle border border-indigo-200 dark:border-indigo-800">
        {TRUST_STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-4">
            {i > 0 && <div className="h-8 w-px bg-indigo-200 dark:bg-indigo-700" />}
            <div className="text-center">
              <div className="text-lg font-bold text-sequence-gradient">{stat.value}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">{stat.label}</div>
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
            className="h-auto flex-col items-start gap-2 p-4 text-left border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 transition-all group"
            onClick={() => onExampleClick(example.query)}
          >
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sequence-gradient group-hover:scale-110 transition-transform">
                <example.icon className="h-3.5 w-3.5 text-white" />
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
