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
  const [vialSize, setVialSize] = useState(defaultVialSize)
  const [bacWater, setBacWater] = useState(defaultBacWater)
  const [desiredDose, setDesiredDose] = useState(250)

  const calculation = useMemo(() => {
    if (!vialSize || !bacWater || !desiredDose) return null

    const concentrationMcgPerMl = (vialSize * 1000) / bacWater
    const volumeNeededMl = desiredDose / concentrationMcgPerMl
    const unitsToDraw = Math.round(volumeNeededMl * 100 * 10) / 10
    const dosesPerVial = Math.floor((vialSize * 1000) / desiredDose)

    return {
      concentrationMgPerMl: vialSize / bacWater,
      unitsToDraw,
      dosesPerVial,
    }
  }, [vialSize, bacWater, desiredDose])

  const handleApply = () => {
    if (calculation && onDoseCalculated) {
      onDoseCalculated(desiredDose, calculation.unitsToDraw)
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Dose Calculator
          </span>
          {calculation && !isExpanded && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              • {desiredDose} mcg = {calculation.unitsToDraw} units
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
            <div className="px-3 pb-3 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
              {/* Quick inputs row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Vial (mg)
                  </label>
                  <input
                    type="number"
                    value={vialSize}
                    onChange={(e) => setVialSize(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Water (ml)
                  </label>
                  <input
                    type="number"
                    value={bacWater}
                    onChange={(e) => setBacWater(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Dose (mcg)
                  </label>
                  <input
                    type="number"
                    value={desiredDose}
                    onChange={(e) => setDesiredDose(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick dose buttons */}
              <div className="flex gap-1.5 flex-wrap">
                {[100, 250, 500].map((dose) => (
                  <button
                    key={dose}
                    onClick={() => setDesiredDose(dose)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      desiredDose === dose
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {dose} mcg
                  </button>
                ))}
              </div>

              {/* Result */}
              {calculation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Draw to:
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {calculation.unitsToDraw} units
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    <p>{calculation.concentrationMgPerMl.toFixed(1)} mg/ml</p>
                    <p>{calculation.dosesPerVial} doses/vial</p>
                  </div>
                </div>
              )}

              {/* Visual mini syringe */}
              {calculation && (
                <MiniSyringe units={calculation.unitsToDraw} />
              )}

              {/* Apply button (if callback provided) */}
              {onDoseCalculated && calculation && (
                <button
                  onClick={handleApply}
                  className="w-full py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  Use this dose ({desiredDose} mcg)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MiniSyringe({ units }: { units: number }) {
  const maxUnits = 100
  const fillPercentage = Math.min((units / maxUnits) * 100, 100)

  return (
    <div className="relative h-6">
      <div className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full border border-slate-300 dark:border-slate-600 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillPercentage}%` }}
          className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-1.5 rounded">
          {units} units
        </span>
      </div>
    </div>
  )
}

export default MiniCalculator
