'use client'

import { PeptideCalculator, ReconstitutionFAQ } from '@/components/tools/PeptideCalculator'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CalculatorPage() {
  return (
    <div className="pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Peptide Tools</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Calculator & Reconstitution Guide</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Calculator */}
        <PeptideCalculator />

        {/* Reconstitution FAQ */}
        <ReconstitutionFAQ />

        {/* Disclaimer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          This information is for research and educational purposes only, not medical advice.
        </p>
      </main>
    </div>
  )
}
