'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface PeptideCalculatorProps {
  initialVialSize?: number
  initialBacWater?: number
  initialDose?: number
  onClose?: () => void
}

const SYRINGE_SIZES = [
  { value: 0.3, label: '0.3 ml', units: 30 },
  { value: 0.5, label: '0.5 ml', units: 50 },
  { value: 1.0, label: '1.0 ml', units: 100 },
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
}: PeptideCalculatorProps) {
  const [syringeSize, setSyringeSize] = useState(1.0)
  const [vialSize, setVialSize] = useState(initialVialSize)
  const [bacWater, setBacWater] = useState(initialBacWater)
  const [desiredDose, setDesiredDose] = useState(initialDose)
  const [customVial, setCustomVial] = useState('')
  const [customBacWater, setCustomBacWater] = useState('')
  const [customDose, setCustomDose] = useState('')

  const calculation = useMemo(() => {
    const actualVial = customVial ? parseFloat(customVial) : vialSize
    const actualBac = customBacWater ? parseFloat(customBacWater) : bacWater
    const actualDose = customDose ? parseFloat(customDose) : desiredDose

    if (!actualVial || !actualBac || !actualDose) return null

    const concentrationMcgPerMl = (actualVial * 1000) / actualBac
    const volumeNeededMl = actualDose / concentrationMcgPerMl
    const unitsToDraw = volumeNeededMl * 100

    const selectedSyringe = SYRINGE_SIZES.find(s => s.value === syringeSize)
    const maxUnits = selectedSyringe?.units || 100
    const exceedsSyringe = unitsToDraw > maxUnits

    return {
      unitsToDraw: Math.round(unitsToDraw * 10) / 10,
      exceedsSyringe,
      maxUnits,
      doseMcg: actualDose,
    }
  }, [vialSize, bacWater, desiredDose, syringeSize, customVial, customBacWater, customDose])

  const selectedSyringe = SYRINGE_SIZES.find(s => s.value === syringeSize)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-6 py-4">
        <h2 className="text-xl font-bold text-white text-center">PEPTIDE CALCULATOR</h2>
        <div className="w-12 h-0.5 bg-slate-600 mx-auto mt-2" />
      </div>

      <div className="p-6 space-y-8">
        {/* Main inputs grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Syringe Selection */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              What is the total volume of your syringe?
            </h3>
            <div className="space-y-3">
              {SYRINGE_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSyringeSize(size.value)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                    syringeSize === size.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {/* Syringe visual */}
                  <div className="flex-shrink-0 w-32 h-8 relative">
                    <SyringeIcon size={size.value} selected={syringeSize === size.value} />
                  </div>
                  <span className={`font-semibold ${
                    syringeSize === size.value
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {size.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Vial, Water, Dose */}
          <div className="space-y-6">
            {/* Vial size */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select Peptide Vial Quantity
              </h3>
              <div className="flex flex-wrap gap-2">
                {VIAL_SIZES.map((size) => (
                  <OptionButton
                    key={size.value}
                    selected={vialSize === size.value && !customVial}
                    onClick={() => { setVialSize(size.value); setCustomVial('') }}
                  >
                    {size.label}
                  </OptionButton>
                ))}
                <input
                  type="number"
                  placeholder="Other"
                  value={customVial}
                  onChange={(e) => setCustomVial(e.target.value)}
                  className="w-20 px-3 py-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bac water */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                How much bacteriostatic water are you adding?
              </h3>
              <div className="flex flex-wrap gap-2">
                {BAC_WATER_AMOUNTS.map((amount) => (
                  <OptionButton
                    key={amount.value}
                    selected={bacWater === amount.value && !customBacWater}
                    onClick={() => { setBacWater(amount.value); setCustomBacWater('') }}
                  >
                    {amount.label}
                  </OptionButton>
                ))}
                <input
                  type="number"
                  placeholder="Other"
                  value={customBacWater}
                  onChange={(e) => setCustomBacWater(e.target.value)}
                  className="w-20 px-3 py-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Desired dose */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                How much of the Peptide do you want in each dose?
              </h3>
              <div className="flex flex-wrap gap-2">
                {DOSE_OPTIONS.map((dose) => (
                  <OptionButton
                    key={dose.value}
                    selected={desiredDose === dose.value && !customDose}
                    onClick={() => { setDesiredDose(dose.value); setCustomDose('') }}
                  >
                    {dose.label}
                  </OptionButton>
                ))}
                <input
                  type="number"
                  placeholder="Other"
                  value={customDose}
                  onChange={(e) => setCustomDose(e.target.value)}
                  className="w-20 px-3 py-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {calculation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            {calculation.exceedsSyringe ? (
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <p className="font-medium">
                  Syringe volume is not sufficient for specified dosage.
                  Use a larger syringe or reduce the dose.
                </p>
              </div>
            ) : (
              <>
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
                  To have a dose of <span className="font-bold text-slate-900 dark:text-white">{calculation.doseMcg} mcg</span> pull the syringe to{' '}
                  <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">{calculation.unitsToDraw}</span>
                </p>

                {/* Visual Syringe */}
                <VisualSyringe
                  maxUnits={selectedSyringe?.units || 100}
                  fillUnits={calculation.unitsToDraw}
                  syringeSize={syringeSize}
                />
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function OptionButton({
  children,
  selected,
  onClick
}: {
  children: React.ReactNode
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
        selected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function SyringeIcon({ size, selected }: { size: number; selected: boolean }) {
  // Visual representation of different syringe sizes
  const width = size === 0.3 ? 'w-16' : size === 0.5 ? 'w-24' : 'w-32'
  const color = selected ? 'text-purple-500' : 'text-orange-400'

  return (
    <svg viewBox="0 0 120 24" className={`${width} h-6 ${color}`}>
      {/* Plunger */}
      <rect x="0" y="8" width="20" height="8" fill="currentColor" rx="1" />
      <rect x="15" y="6" width="4" height="12" fill="currentColor" rx="1" />

      {/* Barrel */}
      <rect x="19" y="4" width={size === 0.3 ? 50 : size === 0.5 ? 70 : 90} height="16"
            fill="none" stroke="currentColor" strokeWidth="2" rx="2" />

      {/* Tick marks */}
      {[...Array(size === 0.3 ? 6 : size === 0.5 ? 10 : 10)].map((_, i) => (
        <line
          key={i}
          x1={25 + i * (size === 0.3 ? 7 : size === 0.5 ? 6 : 8)}
          y1="6"
          x2={25 + i * (size === 0.3 ? 7 : size === 0.5 ? 6 : 8)}
          y2="10"
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}

      {/* Needle hub */}
      <rect x={size === 0.3 ? 69 : size === 0.5 ? 89 : 109} y="9" width="8" height="6" fill="currentColor" rx="1" />

      {/* Needle */}
      <line x1={size === 0.3 ? 77 : size === 0.5 ? 97 : 117} y1="12"
            x2={size === 0.3 ? 90 : size === 0.5 ? 110 : 120} y2="12"
            stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function VisualSyringe({ maxUnits, fillUnits, syringeSize }: { maxUnits: number; fillUnits: number; syringeSize: number }) {
  const fillPercentage = Math.min((fillUnits / maxUnits) * 100, 100)

  // Generate tick marks based on syringe size
  const ticks = maxUnits === 30
    ? [0, 5, 10, 15, 20, 25, 30]
    : maxUnits === 50
    ? [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  return (
    <div className="space-y-2">
      {/* Syringe body */}
      <div className="relative">
        <div className="h-12 bg-white dark:bg-slate-700 rounded-lg border-2 border-slate-300 dark:border-slate-500 overflow-hidden relative">
          {/* Fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-500"
          />

          {/* Tick marks inside */}
          <div className="absolute inset-0 flex">
            {ticks.map((tick, i) => (
              <div
                key={tick}
                className="flex-1 border-r border-slate-300/50 dark:border-slate-500/50 last:border-r-0"
              />
            ))}
          </div>
        </div>

        {/* Arrow indicator */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${fillPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute -top-8 transform -translate-x-1/2"
          style={{ left: `${fillPercentage}%` }}
        >
          <div className="bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded shadow-lg">
            {fillUnits}
          </div>
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-purple-600 mx-auto" />
        </motion.div>
      </div>

      {/* Labels */}
      <div className="flex justify-between px-0.5">
        {ticks.map((tick) => (
          <span
            key={tick}
            className={`text-xs ${
              Math.abs(tick - fillUnits) < 3
                ? 'font-bold text-purple-600 dark:text-purple-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  )
}

export default PeptideCalculator
