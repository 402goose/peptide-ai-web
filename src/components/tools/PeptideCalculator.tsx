'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

// Syringe image paths
const SYRINGE_IMAGES: Record<number, string> = {
  0.3: '/images/syringe-30-units.png',
  0.5: '/images/syringe-50-units.png',
  1.0: '/images/syringe-100-units.png',
}

// Vial icon (brown bottle like Particle Peptides)
function VialIcon() {
  return (
    <svg width="44" height="64" viewBox="0 0 44 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="2" width="16" height="8" rx="2" fill="#6B4423" />
      <rect x="16" y="10" width="12" height="4" fill="#8B6914" />
      <rect x="10" y="14" width="24" height="44" rx="4" fill="#8B4513" />
      <rect x="12" y="18" width="20" height="10" rx="2" fill="#F5F5DC" />
      <line x1="14" y1="22" x2="30" y2="22" stroke="#999" strokeWidth="1" />
      <line x1="14" y1="25" x2="26" y2="25" stroke="#999" strokeWidth="1" />
    </svg>
  )
}

// Bac water icon (clear bottle with yellow cap)
function BacWaterIcon() {
  return (
    <svg width="44" height="64" viewBox="0 0 44 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="2" width="12" height="6" rx="2" fill="#FFD700" />
      <path d="M18 8 L18 12 L12 18 L12 56 C12 58 14 60 16 60 L28 60 C30 60 32 58 32 56 L32 18 L26 12 L26 8 Z" fill="#E8F4F8" stroke="#B0C4DE" strokeWidth="1.5" />
      <path d="M14 28 L14 54 C14 56 16 58 18 58 L26 58 C28 58 30 56 30 54 L30 28 Z" fill="#87CEEB" opacity="0.4" />
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

      <div className="p-4 md:p-6">
        {/* Main grid: Syringe selection | Icon | Options */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Syringe Selection */}
          <div className="md:w-[45%]">
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">
              What is the total volume of your syringe?
            </h3>
            <div className="space-y-2">
              {[
                { value: 0.3, label: '0.3 ml', height: 'h-6' },
                { value: 0.5, label: '0.5 ml', height: 'h-7' },
                { value: 1.0, label: '1.0 ml', height: 'h-8' },
              ].map((syringe) => (
                <button
                  key={syringe.value}
                  onClick={() => setSyringeSize(syringe.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    syringeSize === syringe.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <span className={`text-sm font-medium min-w-[45px] ${
                    syringeSize === syringe.value
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {syringe.label}
                  </span>
                  <div className={`flex-1 ${syringe.height} relative`}>
                    <Image
                      src={SYRINGE_IMAGES[syringe.value]}
                      alt={`${syringe.label} insulin syringe`}
                      fill
                      className="object-contain object-left"
                      unoptimized
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Vial & Water with icons */}
          <div className="md:w-[55%] space-y-4">
            {/* Vial Size Row */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 hidden sm:block">
                <VialIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                  Select Peptide Vial Quantity
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {[5, 10, 15].map((size) => (
                    <button
                      key={size}
                      onClick={() => { setVialSize(size); setUseCustomVial(false) }}
                      className={`px-3 py-1 text-sm rounded border transition-all ${
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
                    className={`px-3 py-1 text-sm rounded border transition-all ${
                      useCustomVial
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    Other
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Enter vial quantity</span>
                  <input
                    type="number"
                    value={customVial}
                    onChange={(e) => { setCustomVial(e.target.value); setUseCustomVial(true) }}
                    className="w-20 px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bac Water Row */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 hidden sm:block">
                <BacWaterIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                  How much bacteriostatic water are you adding?
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 5].map((ml) => (
                    <button
                      key={ml}
                      onClick={() => { setBacWater(ml); setUseCustomBacWater(false) }}
                      className={`px-3 py-1 text-sm rounded border transition-all ${
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
                    className={`px-3 py-1 text-sm rounded border transition-all ${
                      useCustomBacWater
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    Other
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Enter bacteriostatic water amount</span>
                  <input
                    type="number"
                    value={customBacWater}
                    onChange={(e) => { setCustomBacWater(e.target.value); setUseCustomBacWater(true) }}
                    className="w-20 px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dose Section - Full Width */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
            How much of the Peptide do you want in each dose?
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {[50, 100, 250, 500].map((dose) => (
              <button
                key={dose}
                onClick={() => { setDesiredDose(dose); setUseCustomDose(false) }}
                className={`px-3 py-1 text-sm rounded border transition-all ${
                  desiredDose === dose && !useCustomDose
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
                }`}
              >
                {dose} mcg
              </button>
            ))}
            <button
              onClick={() => setUseCustomDose(true)}
              className={`px-3 py-1 text-sm rounded border transition-all ${
                useCustomDose
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
              }`}
            >
              Other
            </button>
            {useCustomDose && (
              <input
                type="number"
                placeholder="mcg"
                value={customDose}
                onChange={(e) => setCustomDose(e.target.value)}
                className="w-20 px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-purple-500 focus:outline-none"
                autoFocus
              />
            )}
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
  );
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
