'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react'

interface MiniCalculatorProps {
  defaultVialSize?: number
  defaultBacWater?: number
  onDoseCalculated?: (dose: number, units: number) => void
  peptideName?: string
}

export function MiniCalculator({
  defaultVialSize = 10,
  defaultBacWater = 2,
  onDoseCalculated,
  peptideName,
}: MiniCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Syringe selection
  const [syringeSize, setSyringeSize] = useState(1.0)

  // Vial settings
  const [vialUnit, setVialUnit] = useState<'mg' | 'mcg'>('mg')
  const [vialSize, setVialSize] = useState(defaultVialSize)
  const [customVial, setCustomVial] = useState('')
  const [useCustomVial, setUseCustomVial] = useState(false)

  // Bac water settings
  const [bacWater, setBacWater] = useState(defaultBacWater)
  const [customBacWater, setCustomBacWater] = useState('')
  const [useCustomBacWater, setUseCustomBacWater] = useState(false)

  // Dose settings
  const [desiredDose, setDesiredDose] = useState(250)
  const [customDose, setCustomDose] = useState('')
  const [useCustomDose, setUseCustomDose] = useState(false)

  const vialOptions = vialUnit === 'mg' ? [5, 10, 15] : [1000, 2000, 3000]

  const calculation = useMemo(() => {
    const actualVialInput = useCustomVial ? parseFloat(customVial) || 0 : vialSize
    const actualBac = useCustomBacWater ? parseFloat(customBacWater) || 0 : bacWater
    const actualDose = useCustomDose ? parseFloat(customDose) || 0 : desiredDose

    if (!actualVialInput || !actualBac || !actualDose) return null

    // Convert vial to mcg for calculation
    const vialInMcg = vialUnit === 'mg' ? actualVialInput * 1000 : actualVialInput

    const concentrationMcgPerMl = vialInMcg / actualBac
    const volumeNeededMl = actualDose / concentrationMcgPerMl
    const unitsToDraw = Math.round(volumeNeededMl * 100 * 10) / 10

    const maxUnits = syringeSize === 0.3 ? 30 : syringeSize === 0.5 ? 50 : 100
    const exceedsSyringe = unitsToDraw > maxUnits
    const dosesPerVial = Math.floor(vialInMcg / actualDose)

    return {
      unitsToDraw,
      exceedsSyringe,
      maxUnits,
      dosesPerVial,
      concentrationMgPerMl: vialInMcg / 1000 / actualBac,
    }
  }, [vialSize, vialUnit, bacWater, desiredDose, syringeSize, customVial, customBacWater, customDose, useCustomVial, useCustomBacWater, useCustomDose])

  const [applied, setApplied] = useState(false)

  const handleApply = () => {
    if (calculation && onDoseCalculated) {
      const actualDose = useCustomDose ? parseFloat(customDose) || 0 : desiredDose
      onDoseCalculated(actualDose, calculation.unitsToDraw)
      setApplied(true)
      // Collapse after a brief moment to show success
      setTimeout(() => {
        setIsExpanded(false)
        // Reset applied state after collapse
        setTimeout(() => setApplied(false), 300)
      }, 500)
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calculator className={`w-4 h-4 ${applied ? 'text-green-500' : 'text-blue-500'}`} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Dose Calculator
          </span>
          {calculation && !isExpanded && (
            <span className={`text-xs ${applied ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
              {applied ? '✓ ' : '• '}{useCustomDose ? customDose : desiredDose} mcg = {calculation.unitsToDraw} units
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-3">
              {/* Syringe Size Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Syringe Size
                </label>
                <div className="flex gap-1.5">
                  {[
                    { value: 0.3, label: '0.3ml (30u)' },
                    { value: 0.5, label: '0.5ml (50u)' },
                    { value: 1.0, label: '1.0ml (100u)' },
                  ].map((syringe) => (
                    <button
                      key={syringe.value}
                      type="button"
                      onClick={() => setSyringeSize(syringe.value)}
                      className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                        syringeSize === syringe.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {syringe.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vial Size */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Peptide Vial
                  </label>
                  <div className="flex rounded overflow-hidden border border-slate-300 dark:border-slate-600">
                    <button
                      type="button"
                      onClick={() => { setVialUnit('mg'); setVialSize(5); setUseCustomVial(false) }}
                      className={`px-2 py-0.5 text-xs font-medium transition-all ${
                        vialUnit === 'mg'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      mg
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVialUnit('mcg'); setVialSize(1000); setUseCustomVial(false) }}
                      className={`px-2 py-0.5 text-xs font-medium transition-all ${
                        vialUnit === 'mcg'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      mcg
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {vialOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => { setVialSize(size); setUseCustomVial(false) }}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        vialSize === size && !useCustomVial
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {size} {vialUnit}
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Other"
                    value={customVial}
                    onChange={(e) => { setCustomVial(e.target.value); setUseCustomVial(true) }}
                    className={`w-16 px-2 py-1 text-xs rounded border transition-all ${
                      useCustomVial
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none`}
                  />
                </div>
              </div>

              {/* Bacteriostatic Water */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Bacteriostatic Water (ml)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 5].map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => { setBacWater(ml); setUseCustomBacWater(false) }}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        bacWater === ml && !useCustomBacWater
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {ml} ml
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Other"
                    value={customBacWater}
                    onChange={(e) => { setCustomBacWater(e.target.value); setUseCustomBacWater(true) }}
                    className={`w-16 px-2 py-1 text-xs rounded border transition-all ${
                      useCustomBacWater
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none`}
                  />
                </div>
              </div>

              {/* Desired Dose */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Desired Dose (mcg)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[50, 100, 250, 500].map((dose) => (
                    <button
                      key={dose}
                      type="button"
                      onClick={() => { setDesiredDose(dose); setUseCustomDose(false) }}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        desiredDose === dose && !useCustomDose
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {dose} mcg
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Other"
                    value={customDose}
                    onChange={(e) => { setCustomDose(e.target.value); setUseCustomDose(true) }}
                    className={`w-16 px-2 py-1 text-xs rounded border transition-all ${
                      useCustomDose
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none`}
                  />
                </div>
              </div>

              {/* Result */}
              {calculation && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Draw to:</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {calculation.unitsToDraw} units
                    </span>
                  </div>

                  {calculation.exceedsSyringe && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                      ⚠️ Exceeds syringe capacity ({calculation.maxUnits} units)
                    </p>
                  )}

                  {/* Visual syringe indicator */}
                  <div className="relative h-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((calculation.unitsToDraw / calculation.maxUnits) * 100, 100)}%` }}
                      className={`h-full rounded-full ${
                        calculation.exceedsSyringe
                          ? 'bg-gradient-to-r from-amber-400 to-red-500'
                          : 'bg-gradient-to-r from-blue-400 to-purple-500'
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-slate-700 dark:text-white bg-white/60 dark:bg-slate-900/60 px-1 rounded">
                        {calculation.unitsToDraw} / {calculation.maxUnits}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{calculation.concentrationMgPerMl.toFixed(2)} mg/ml</span>
                    <span>{calculation.dosesPerVial} doses per vial</span>
                  </div>
                </div>
              )}

              {/* Apply button (if callback provided) */}
              {onDoseCalculated && calculation && (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applied}
                  className={`w-full py-2 text-sm rounded-lg transition-all font-medium ${
                    applied
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {applied ? '✓ Applied!' : `Use this dose (${useCustomDose ? customDose : desiredDose} mcg)`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MiniCalculator
