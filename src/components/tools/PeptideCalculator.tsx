'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Droplets, Syringe, FlaskConical, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PeptideCalculatorProps {
  initialVialSize?: number
  initialBacWater?: number
  initialDose?: number
  onClose?: () => void
  compact?: boolean
}

const SYRINGE_SIZES = [
  { value: 0.3, label: '0.3 ml', units: 30, description: 'U-30 (30 units)' },
  { value: 0.5, label: '0.5 ml', units: 50, description: 'U-50 (50 units)' },
  { value: 1.0, label: '1.0 ml', units: 100, description: 'U-100 (100 units)' },
]

const VIAL_SIZES = [
  { value: 5, label: '5 mg' },
  { value: 10, label: '10 mg' },
  { value: 15, label: '15 mg' },
]

const BAC_WATER_AMOUNTS = [
  { value: 1, label: '1 ml' },
  { value: 2, label: '2 ml' },
  { value: 3, label: '3 ml' },
  { value: 5, label: '5 ml' },
]

const DOSE_OPTIONS = [
  { value: 50, label: '50 mcg' },
  { value: 100, label: '100 mcg' },
  { value: 250, label: '250 mcg' },
  { value: 500, label: '500 mcg' },
]

export function PeptideCalculator({
  initialVialSize = 10,
  initialBacWater = 2,
  initialDose = 250,
  onClose,
  compact = false,
}: PeptideCalculatorProps) {
  const [syringeSize, setSyringeSize] = useState(1.0)
  const [vialSize, setVialSize] = useState(initialVialSize)
  const [bacWater, setBacWater] = useState(initialBacWater)
  const [desiredDose, setDesiredDose] = useState(initialDose)
  const [customVial, setCustomVial] = useState('')
  const [customBacWater, setCustomBacWater] = useState('')
  const [customDose, setCustomDose] = useState('')

  // Calculate the concentration and units to draw
  const calculation = useMemo(() => {
    const actualVial = customVial ? parseFloat(customVial) : vialSize
    const actualBac = customBacWater ? parseFloat(customBacWater) : bacWater
    const actualDose = customDose ? parseFloat(customDose) : desiredDose

    if (!actualVial || !actualBac || !actualDose) {
      return null
    }

    // Concentration in mcg/ml
    const concentrationMcgPerMl = (actualVial * 1000) / actualBac
    // Volume needed in ml
    const volumeNeededMl = actualDose / concentrationMcgPerMl
    // Units to draw (100 units = 1ml)
    const unitsToDraw = volumeNeededMl * 100
    // How many doses per vial
    const dosesPerVial = Math.floor((actualVial * 1000) / actualDose)

    const selectedSyringe = SYRINGE_SIZES.find(s => s.value === syringeSize)
    const maxUnits = selectedSyringe?.units || 100

    return {
      concentrationMcgPerMl,
      concentrationMgPerMl: actualVial / actualBac,
      volumeNeededMl,
      unitsToDraw: Math.round(unitsToDraw * 10) / 10,
      dosesPerVial,
      exceedsSyringe: unitsToDraw > maxUnits,
      maxUnits,
      vialMg: actualVial,
      bacWaterMl: actualBac,
      doseMcg: actualDose,
    }
  }, [vialSize, bacWater, desiredDose, syringeSize, customVial, customBacWater, customDose])

  const syringeInfo = SYRINGE_SIZES.find(s => s.value === syringeSize)

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Peptide Calculator</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-5">
          {/* Syringe Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Syringe className="w-4 h-4 inline mr-1" />
              Syringe Size
            </label>
            <div className="flex gap-2">
              {SYRINGE_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSyringeSize(size.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    syringeSize === size.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">{syringeInfo?.description}</p>
          </div>

          {/* Vial Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <FlaskConical className="w-4 h-4 inline mr-1" />
              Peptide Vial Quantity
            </label>
            <div className="flex gap-2 flex-wrap">
              {VIAL_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => { setVialSize(size.value); setCustomVial('') }}
                  className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    vialSize === size.value && !customVial
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {size.label}
                </button>
              ))}
              <input
                type="number"
                placeholder="Other"
                value={customVial}
                onChange={(e) => setCustomVial(e.target.value)}
                className="w-20 py-2 px-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-sm bg-transparent focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bac Water */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Droplets className="w-4 h-4 inline mr-1" />
              Bacteriostatic Water
            </label>
            <div className="flex gap-2 flex-wrap">
              {BAC_WATER_AMOUNTS.map((amount) => (
                <button
                  key={amount.value}
                  onClick={() => { setBacWater(amount.value); setCustomBacWater('') }}
                  className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    bacWater === amount.value && !customBacWater
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {amount.label}
                </button>
              ))}
              <input
                type="number"
                placeholder="Other"
                value={customBacWater}
                onChange={(e) => setCustomBacWater(e.target.value)}
                className="w-20 py-2 px-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-sm bg-transparent focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Desired Dose */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Desired Dose (per injection)
            </label>
            <div className="flex gap-2 flex-wrap">
              {DOSE_OPTIONS.map((dose) => (
                <button
                  key={dose.value}
                  onClick={() => { setDesiredDose(dose.value); setCustomDose('') }}
                  className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    desiredDose === dose.value && !customDose
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {dose.label}
                </button>
              ))}
              <input
                type="number"
                placeholder="Other"
                value={customDose}
                onChange={(e) => setCustomDose(e.target.value)}
                className="w-20 py-2 px-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-sm bg-transparent focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {calculation && (
            <>
              {/* Main Result */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  To get a dose of <span className="font-semibold text-slate-900 dark:text-white">{calculation.doseMcg} mcg</span>
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Draw to {calculation.unitsToDraw} units
                </p>
                {calculation.exceedsSyringe && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    Exceeds syringe capacity ({calculation.maxUnits} units). Use larger syringe or split dose.
                  </p>
                )}
              </motion.div>

              {/* Visual Syringe */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Visual Guide ({syringeInfo?.label} syringe)
                </p>
                <SyringeVisual
                  maxUnits={calculation.maxUnits}
                  fillUnits={Math.min(calculation.unitsToDraw, calculation.maxUnits)}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Concentration</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {calculation.concentrationMgPerMl.toFixed(1)} mg/ml
                  </p>
                  <p className="text-xs text-slate-500">
                    ({calculation.concentrationMcgPerMl.toFixed(0)} mcg/ml)
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vial Lasts</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {calculation.dosesPerVial} doses
                  </p>
                  <p className="text-xs text-slate-500">
                    at {calculation.doseMcg} mcg each
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Summary:</p>
                <p>
                  Add <strong>{calculation.bacWaterMl} ml</strong> bac water to your{' '}
                  <strong>{calculation.vialMg} mg</strong> vial.
                  For <strong>{calculation.doseMcg} mcg</strong>, draw to{' '}
                  <strong>{calculation.unitsToDraw} units</strong> on your syringe.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Visual syringe component
function SyringeVisual({ maxUnits, fillUnits }: { maxUnits: number; fillUnits: number }) {
  const fillPercentage = (fillUnits / maxUnits) * 100

  // Generate tick marks
  const majorTicks = maxUnits === 30 ? [0, 5, 10, 15, 20, 25, 30] :
                     maxUnits === 50 ? [0, 10, 20, 30, 40, 50] :
                     [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  return (
    <div className="relative">
      {/* Syringe body */}
      <div className="relative h-10 bg-white dark:bg-slate-700 rounded-full border-2 border-slate-300 dark:border-slate-600 overflow-hidden">
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600"
        />

        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between px-1">
          {majorTicks.map((tick) => (
            <div key={tick} className="relative">
              <div className="absolute top-0 w-px h-3 bg-slate-400 dark:bg-slate-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1 px-1">
        {majorTicks.map((tick) => (
          <span
            key={tick}
            className={`text-xs ${
              tick === Math.round(fillUnits)
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {tick}
          </span>
        ))}
      </div>

      {/* Arrow indicator */}
      <motion.div
        initial={{ left: 0 }}
        animate={{ left: `${fillPercentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute -top-6 transform -translate-x-1/2"
        style={{ left: `${fillPercentage}%` }}
      >
        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
          {fillUnits}
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600 mx-auto" />
      </motion.div>
    </div>
  )
}

export default PeptideCalculator
