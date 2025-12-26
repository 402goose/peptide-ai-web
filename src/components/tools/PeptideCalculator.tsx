'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

// Inline SVG syringe component for visual representation
function SyringeSVG({ size, isSelected }: { size: 0.3 | 0.5 | 1.0; isSelected: boolean }) {
  const widths = { 0.3: 80, 0.5: 100, 1.0: 120 }
  const width = widths[size]
  const color = isSelected ? '#7c3aed' : '#64748b'

  return (
    <svg width={width} height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Plunger handle */}
      <rect x="2" y="10" width="12" height="8" rx="1" fill={color} opacity="0.6" />
      {/* Plunger rod */}
      <rect x="14" y="12" width="20" height="4" fill={color} opacity="0.4" />
      {/* Syringe barrel */}
      <rect x="34" y="8" width="70" height="12" rx="2" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      {/* Graduation marks */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={40 + i * 8} y1="8" x2={40 + i * 8} y2={i % 2 === 0 ? "12" : "10"} stroke={color} strokeWidth="1" opacity="0.5" />
      ))}
      {/* Needle hub */}
      <rect x="104" y="11" width="8" height="6" rx="1" fill={color} opacity="0.5" />
      {/* Needle */}
      <line x1="112" y1="14" x2="118" y2="14" stroke={color} strokeWidth="1" />
    </svg>
  )
}

// Inline SVG vial component
function VialSVG() {
  return (
    <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cap */}
      <rect x="14" y="2" width="20" height="8" rx="2" fill="#7c3aed" />
      {/* Neck */}
      <rect x="18" y="10" width="12" height="6" fill="#94a3b8" />
      {/* Body */}
      <rect x="8" y="16" width="32" height="42" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
      {/* Liquid */}
      <rect x="10" y="28" width="28" height="28" rx="2" fill="#7c3aed" opacity="0.2" />
      {/* Label */}
      <rect x="12" y="32" width="24" height="12" rx="1" fill="white" opacity="0.8" />
      <line x1="14" y1="36" x2="34" y2="36" stroke="#94a3b8" strokeWidth="1" />
      <line x1="14" y1="40" x2="28" y2="40" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  )
}

// Inline SVG bacteriostatic water bottle
function BacWaterSVG() {
  return (
    <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cap */}
      <rect x="16" y="2" width="16" height="6" rx="2" fill="#0ea5e9" />
      {/* Neck */}
      <path d="M18 8 L18 14 L12 22 L12 58 C12 60 14 62 16 62 L32 62 C34 62 36 60 36 58 L36 22 L30 14 L30 8 Z" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="2" />
      {/* Water level */}
      <path d="M14 30 L14 56 C14 58 16 60 18 60 L30 60 C32 60 34 58 34 56 L34 30 Z" fill="#0ea5e9" opacity="0.3" />
      {/* Label */}
      <rect x="14" y="36" width="20" height="14" rx="1" fill="white" opacity="0.9" />
      <text x="24" y="45" textAnchor="middle" fontSize="6" fill="#0369a1" fontWeight="bold">BAC</text>
      <text x="24" y="48" textAnchor="middle" fontSize="4" fill="#64748b">WATER</text>
    </svg>
  )
}

export function PeptideCalculator() {
  const [syringeSize, setSyringeSize] = useState(1.0)
  const [vialSize, setVialSize] = useState(5)
  const [customVial, setCustomVial] = useState('1')
  const [bacWater, setBacWater] = useState(3)
  const [customBacWater, setCustomBacWater] = useState('1')
  const [desiredDose, setDesiredDose] = useState(100)
  const [customDose, setCustomDose] = useState('')
  const [useCustomVial, setUseCustomVial] = useState(false)
  const [useCustomBacWater, setUseCustomBacWater] = useState(false)
  const [useCustomDose, setUseCustomDose] = useState(false)

  const calculation = useMemo(() => {
    const actualVial = useCustomVial ? parseFloat(customVial) || 0 : vialSize
    const actualBac = useCustomBacWater ? parseFloat(customBacWater) || 0 : bacWater
    const actualDose = useCustomDose ? parseFloat(customDose) || 0 : desiredDose

    if (!actualVial || !actualBac || !actualDose) return null

    const concentrationMcgPerMl = (actualVial * 1000) / actualBac
    const volumeNeededMl = actualDose / concentrationMcgPerMl
    const unitsToDraw = volumeNeededMl * 100

    const maxUnits = syringeSize === 0.3 ? 30 : syringeSize === 0.5 ? 50 : 100
    const exceedsSyringe = unitsToDraw > maxUnits

    return {
      unitsToDraw: Math.round(unitsToDraw * 10) / 10,
      exceedsSyringe,
      maxUnits,
      doseMcg: actualDose,
    }
  }, [vialSize, bacWater, desiredDose, syringeSize, customVial, customBacWater, customDose, useCustomVial, useCustomBacWater, useCustomDose])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="bg-slate-800 dark:bg-slate-900 px-6 py-5 rounded-t-2xl">
        <h1 className="text-2xl font-bold text-white text-center tracking-wide">PEPTIDE CALCULATOR</h1>
        <div className="w-16 h-1 bg-slate-600 mx-auto mt-3" />
      </div>

      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Syringe Selection */}
          <div>
            <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-4">
              What is the total volume of your syringe?
            </h3>
            <div className="space-y-3">
              {[
                { value: 0.3, label: '0.3 ml', units: 30 },
                { value: 0.5, label: '0.5 ml', units: 50 },
                { value: 1.0, label: '1.0 ml', units: 100 },
              ].map((syringe) => (
                <button
                  key={syringe.value}
                  onClick={() => setSyringeSize(syringe.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    syringeSize === syringe.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <span className={`text-base font-medium min-w-[50px] ${
                    syringeSize === syringe.value
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {syringe.label}
                  </span>
                  <div className="flex-1 flex items-center">
                    <SyringeSVG size={syringe.value as 0.3 | 0.5 | 1.0} isSelected={syringeSize === syringe.value} />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {syringe.units}u
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Vial, Water, Dose */}
          <div className="space-y-6">
            {/* Vial Size */}
            <div className="flex gap-4">
              <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center">
                <VialSVG />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-3">
                  Select Peptide Vial Quantity
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[5, 10, 15].map((size) => (
                    <button
                      key={size}
                      onClick={() => { setVialSize(size); setUseCustomVial(false) }}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                        vialSize === size && !useCustomVial
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {size} mg
                    </button>
                  ))}
                  <button
                    onClick={() => setUseCustomVial(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                      useCustomVial
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    Other
                  </button>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">Enter vial quantity</label>
                  <input
                    type="number"
                    value={customVial}
                    onChange={(e) => { setCustomVial(e.target.value); setUseCustomVial(true) }}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bac Water */}
            <div className="flex gap-4">
              <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center">
                <BacWaterSVG />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-3">
                  How much bacteriostatic water are you adding?
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[1, 2, 3, 5].map((ml) => (
                    <button
                      key={ml}
                      onClick={() => { setBacWater(ml); setUseCustomBacWater(false) }}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                        bacWater === ml && !useCustomBacWater
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {ml} ml
                    </button>
                  ))}
                  <button
                    onClick={() => setUseCustomBacWater(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                      useCustomBacWater
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    Other
                  </button>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">Enter bacteriostatic water amount</label>
                  <input
                    type="number"
                    value={customBacWater}
                    onChange={(e) => { setCustomBacWater(e.target.value); setUseCustomBacWater(true) }}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dose */}
            <div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-3">
                How much of the Peptide do you want in each dose?
              </h3>
              <div className="flex flex-wrap gap-2">
                {[50, 100, 250, 500].map((dose) => (
                  <button
                    key={dose}
                    onClick={() => { setDesiredDose(dose); setUseCustomDose(false) }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
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
                  className="w-20 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none placeholder:text-slate-400"
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
            className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
              To have a dose of <span className="font-bold text-slate-900 dark:text-white">{calculation.doseMcg}</span> mcg pull the syringe to{' '}
              <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">{calculation.unitsToDraw}</span>
            </p>

            {calculation.exceedsSyringe && (
              <p className="text-amber-600 dark:text-amber-400 text-sm mb-4">
                <strong>Warning:</strong> Syringe volume is not sufficient for specified dosage
              </p>
            )}

            {/* Visual Syringe Ruler */}
            <SyringeRuler
              maxUnits={calculation.maxUnits}
              fillUnits={Math.min(calculation.unitsToDraw, calculation.maxUnits)}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

function SyringeRuler({ maxUnits, fillUnits }: { maxUnits: number; fillUnits: number }) {
  const fillPercentage = (fillUnits / maxUnits) * 100

  // Generate tick marks
  const majorTicks = maxUnits === 30
    ? [0, 5, 10, 15, 20, 25, 30]
    : maxUnits === 50
    ? [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  return (
    <div className="relative pt-8">
      {/* Indicator arrow */}
      <motion.div
        initial={{ left: '0%' }}
        animate={{ left: `${fillPercentage}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute top-0 -translate-x-1/2 z-10"
        style={{ left: `${fillPercentage}%` }}
      >
        <div className="bg-purple-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
          {fillUnits}
        </div>
        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-purple-600 mx-auto -mt-1" />
      </motion.div>

      {/* Syringe ruler body */}
      <div className="relative h-10 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded overflow-hidden">
        {/* Fill indicator */}
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${fillPercentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-b from-blue-500 to-blue-600"
        />

        {/* Tick marks */}
        <div className="absolute inset-0 flex">
          {majorTicks.map((tick, i) => (
            <div key={tick} className="flex-1 relative">
              {i < majorTicks.length - 1 && (
                <>
                  {/* Major tick */}
                  <div className="absolute left-0 top-0 w-px h-4 bg-white/80" />
                  {/* Minor ticks */}
                  {[1, 2, 3, 4].map((minor) => (
                    <div
                      key={minor}
                      className="absolute top-0 w-px h-2 bg-white/50"
                      style={{ left: `${minor * 20}%` }}
                    />
                  ))}
                </>
              )}
            </div>
          ))}
          {/* Last tick */}
          <div className="absolute right-0 top-0 w-px h-4 bg-white/80" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1">
        {majorTicks.map((tick) => (
          <span
            key={tick}
            className="text-xs text-slate-600 dark:text-slate-400"
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  )
}

// Collapsible FAQ Section
export function ReconstitutionFAQ() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const sections = [
    {
      id: 'environment',
      title: 'Start Preparing the Environment',
      content: `As with all research work, for successful peptide reconstitution absolute sterility and purity are required when preparing the conditions. Begin by thoroughly washing your hands and donning sterile protective clinical gloves and goggles. Ensure that your workspace is impeccably clean, and that you have all the necessary tools:

• Lyophilized peptide in a glass vial
• Sterile syringe
• Solvent (Bacteriostatic water)
• Gloves and safety glasses

Cleanliness and sterility of the environment is very important for accurate research results.`
    },
    {
      id: 'preparation',
      title: 'Peptide and Solvent Preparation',
      content: `The process of peptide reconstitution requires careful selection of the solvent based on the specific properties of the peptide. We recommend bacteriostatic water for this purpose.

Before reconstituting the peptide, ensure that the peptide powder and solvent that were stored in the cold are brought to room temperature. Using the solutions while they are still cold may interfere with the reconstitution process.

Carefully remove the central part of the metal cap from the vial and disinfect the upper surface with an alcohol swab. This step is crucial for maintaining sterility and preparing the vial for the reconstitution procedure. Repeat the same cleaning process for the solvent vial.`
    },
    {
      id: 'adding',
      title: 'Adding the Solvent',
      content: `Precise handling is crucial when adding solvent to the lyophilized peptide. Using a sterile syringe, carefully withdraw the required amount of solvent and slowly inject it into the peptide vial. Tilt the vial at a 45° angle to allow the solvent to gently run down the interior wall.

This method helps minimize the formation of bubbles and foam, ensuring a smooth and even dissolution of the peptide.

DO NOT shake the vial. Gently swirl or let sit for 5-10 minutes until fully dissolved. The solution should be clear with no visible particles.`
    },
    {
      id: 'storage',
      title: 'Storage of Peptide Solutions',
      content: `Proper storage of lyophilized peptide powder is crucial for maintaining its stability. Store the peptide powder at a minimum of +4°C for short-term use, and ideally at -20°C or lower for long-term storage. Peptide solutions, once reconstituted, have a limited shelf life. To extend their viability, consider freezing aliquots of the solution.

In general, peptide solutions remain stable for 3 or more weeks at +4°C and 3-4 months at -20°C. Avoid repeated cycles of freezing and thawing, as these can compromise peptide integrity.`
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="bg-slate-800 dark:bg-slate-900 px-6 py-5 rounded-t-2xl">
        <h2 className="text-2xl font-bold text-white text-center tracking-wide">CORRECT PEPTIDE RECONSTITUTION</h2>
        <div className="w-16 h-1 bg-slate-600 mx-auto mt-3" />
      </div>

      <div className="p-6 md:p-8">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Our peptides are delivered in the form of lyophilized, i.e. freeze-dried powders, which are resistant to short-term temperature fluctuations during transport. At room temperature, peptides in powder form remain stable even for several weeks. But it is essential to store them properly to maintain their integrity.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Before usage for research purposes, the lyophilized powder must be reconstituted by mixing it with an appropriate solvent to form a solution. Accurate reconstitution is vital to ensure that the peptides retain their potency and bioactivity for further research and trials.
        </p>

        {/* Collapsible sections */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {sections.map((section, index) => (
            <div key={section.id} className={index > 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''}>
              <button
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">{section.title}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 transition-transform ${
                    openSection === section.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 italic">
          Our commitment is to offer researchers expert guidance and high-quality peptides for scientific research. Please note that these instructions are intended solely for informational purposes, human consumption is forbidden.
        </p>
      </div>
    </div>
  )
}

export default PeptideCalculator
