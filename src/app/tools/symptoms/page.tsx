'use client'

import { SymptomBrowser } from '@/components/affiliate'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function SymptomsPage() {
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
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Symptom Guide
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Find holistic approaches for your symptoms
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
                Holistic Symptom Support
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Browse 114 symptoms across 21 categories to find recommended peptides,
                supplements, and lab tests. Each recommendation is based on holistic
                functional medicine approaches.
              </p>
            </div>
          </div>
        </div>

        {/* Symptom Browser */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <SymptomBrowser source="symptom_page" />
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          This information is for research and educational purposes only, not medical advice.
          Always consult with a healthcare provider before starting any new supplement or peptide.
        </p>
      </main>
    </div>
  )
}
