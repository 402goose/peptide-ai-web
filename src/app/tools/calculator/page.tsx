'use client'

import { PeptideCalculator } from '@/components/tools/PeptideCalculator'
import { ArrowLeft, BookOpen, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Peptide Calculator</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Calculate reconstitution and dosing</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Calculator */}
        <PeptideCalculator />

        {/* Reconstitution Guide */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reconstitution Guide</h2>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Prepare Your Environment</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Wash hands thoroughly. Gather: peptide vial, bacteriostatic water, sterile syringe, alcohol swabs.
                  Work on a clean, flat surface.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Temperature Check</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Allow both the peptide powder and bacteriostatic water to reach room temperature.
                  Using cold solutions may interfere with proper dissolution.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Clean the Vials</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Remove the plastic cap from the peptide vial. Use an alcohol swab to clean the rubber stopper.
                  Do the same for your bacteriostatic water vial. Let dry completely.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">4</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Draw the Water</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Use a sterile syringe to draw your calculated amount of bacteriostatic water.
                  Remove air bubbles by gently tapping the syringe.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">5</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Add Water to Peptide</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Insert needle into peptide vial at a 45° angle. <strong>Slowly</strong> inject the water down the side
                  of the vial - do NOT spray directly onto the powder. Let it run down the glass wall.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">6</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Allow to Dissolve</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Do NOT shake!</strong> Gently swirl or let sit for 5-10 minutes until fully dissolved.
                  The solution should be clear with no visible particles.
                </p>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">7</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Store Properly</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Store reconstituted peptide in the refrigerator (2-8°C / 36-46°F).
                  Use within 3-4 weeks. Avoid freezing reconstituted solution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Important Safety Information</h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• This calculator is for research and educational purposes only</li>
                <li>• Always verify calculations before use</li>
                <li>• Peptides are research compounds - consult a healthcare provider</li>
                <li>• Start with lower doses to assess individual tolerance</li>
                <li>• Use sterile technique to prevent contamination</li>
                <li>• Never reuse needles or share supplies</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
