'use client'

import { useState, useRef, useEffect } from 'react'
import { Beaker, X, Plus, ExternalLink, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PeptideInfo {
  name: string
  category: string
  benefits: string[]
  dosing: string
  timing: string
  research: string
}

// Known peptides with quick info
const PEPTIDE_DATABASE: Record<string, PeptideInfo> = {
  'bpc-157': {
    name: 'BPC-157',
    category: 'Healing',
    benefits: ['Gut healing', 'Tissue repair', 'Anti-inflammatory'],
    dosing: '250-500mcg 1-2x daily',
    timing: 'Morning or split AM/PM',
    research: 'Strong (100+ studies)',
  },
  'tb-500': {
    name: 'TB-500',
    category: 'Healing',
    benefits: ['Wound healing', 'Flexibility', 'Muscle repair'],
    dosing: '2-5mg 2x weekly',
    timing: 'Any time',
    research: 'Moderate',
  },
  'semaglutide': {
    name: 'Semaglutide',
    category: 'Weight Loss',
    benefits: ['15-20% weight loss', 'Appetite control', 'Blood sugar regulation'],
    dosing: 'Start 0.25mg weekly, titrate to 2.4mg',
    timing: 'Same day each week',
    research: 'Strong (FDA approved)',
  },
  'tirzepatide': {
    name: 'Tirzepatide',
    category: 'Weight Loss',
    benefits: ['20-25% weight loss', 'Dual GLP-1/GIP action'],
    dosing: 'Start 2.5mg weekly, titrate to 15mg',
    timing: 'Same day each week',
    research: 'Strong (FDA approved)',
  },
  'ipamorelin': {
    name: 'Ipamorelin',
    category: 'Performance',
    benefits: ['Clean GH release', 'Recovery', 'Anti-aging'],
    dosing: '100-300mcg 2-3x daily',
    timing: 'Fasted (morning, pre-bed)',
    research: 'Moderate',
  },
  'cjc-1295': {
    name: 'CJC-1295',
    category: 'Performance',
    benefits: ['Sustained GH release', 'Recovery', 'Fat loss'],
    dosing: '1-2mg weekly or 100-300mcg daily',
    timing: 'Before bed, fasted',
    research: 'Moderate',
  },
  'mk-677': {
    name: 'MK-677',
    category: 'Performance',
    benefits: ['GH release', 'Sleep improvement', 'Muscle growth'],
    dosing: '10-25mg daily (oral)',
    timing: 'Before bed',
    research: 'Strong',
  },
  'ghk-cu': {
    name: 'GHK-Cu',
    category: 'Healing',
    benefits: ['Skin health', 'Wound healing', 'Collagen synthesis'],
    dosing: '1-2mg daily',
    timing: 'Any time, evening for skin',
    research: 'Moderate',
  },
  'semax': {
    name: 'Semax',
    category: 'Cognitive',
    benefits: ['Focus', 'Neuroprotection', 'Memory'],
    dosing: '200-600mcg daily (nasal)',
    timing: 'Morning for focus',
    research: 'Moderate',
  },
  'selank': {
    name: 'Selank',
    category: 'Cognitive',
    benefits: ['Anxiety relief', 'Focus', 'Immune support'],
    dosing: '250-500mcg daily (nasal)',
    timing: 'Morning or as needed',
    research: 'Moderate',
  },
  'epithalon': {
    name: 'Epithalon',
    category: 'Anti-Aging',
    benefits: ['Telomere support', 'Sleep improvement', 'Longevity'],
    dosing: '5-10mg daily for 10-20 days',
    timing: 'Evening',
    research: 'Moderate',
  },
  'tesamorelin': {
    name: 'Tesamorelin',
    category: 'Performance',
    benefits: ['Visceral fat reduction', 'GH release', 'Cognitive benefits'],
    dosing: '1-2mg daily',
    timing: 'Before bed, fasted',
    research: 'Strong (FDA approved)',
  },
  'aod-9604': {
    name: 'AOD-9604',
    category: 'Weight Loss',
    benefits: ['Fat burning', 'No blood sugar effect', 'Cartilage repair'],
    dosing: '300-500mcg daily',
    timing: 'Morning, fasted',
    research: 'Moderate',
  },
  'pt-141': {
    name: 'PT-141',
    category: 'Sexual Health',
    benefits: ['Libido enhancement', 'Works for both sexes'],
    dosing: '1-2mg as needed',
    timing: '45-60 min before',
    research: 'Strong (FDA approved)',
  },
  'thymosin-alpha-1': {
    name: 'Thymosin Alpha-1',
    category: 'Immune',
    benefits: ['Immune boost', 'Infection resistance'],
    dosing: '1.6mg 2-3x weekly',
    timing: 'Morning',
    research: 'Strong',
  },
  'ss-31': {
    name: 'SS-31',
    category: 'Mitochondrial',
    benefits: ['Mitochondrial support', 'Cellular energy', 'Anti-aging'],
    dosing: '1-5mg daily',
    timing: 'Morning',
    research: 'Moderate (clinical trials)',
  },
  'dihexa': {
    name: 'Dihexa',
    category: 'Cognitive',
    benefits: ['Cognitive enhancement', 'Neurogenesis', 'Memory'],
    dosing: '5-20mg daily (oral)',
    timing: 'Morning',
    research: 'Early (potent BDNF)',
  },
  'nad-im': {
    name: 'NAD+ IM',
    category: 'Mitochondrial',
    benefits: ['Cellular energy', 'Anti-aging', 'DNA repair'],
    dosing: '50-200mg IM weekly',
    timing: 'Morning',
    research: 'Moderate',
  },
  'll-37': {
    name: 'LL-37',
    category: 'Immune',
    benefits: ['Antimicrobial', 'Immune modulation', 'Wound healing'],
    dosing: '50-100mcg daily',
    timing: 'Morning or as needed',
    research: 'Moderate',
  },
  'kpv': {
    name: 'KPV',
    category: 'Healing',
    benefits: ['Anti-inflammatory', 'Gut healing', 'Skin health'],
    dosing: '200-500mcg daily',
    timing: 'Morning or with meals',
    research: 'Moderate',
  },
  'larazotide': {
    name: 'Larazotide',
    category: 'Healing',
    benefits: ['Gut barrier support', 'Leaky gut', 'Celiac support'],
    dosing: '0.5-1mg 3x daily',
    timing: 'Before meals',
    research: 'Strong (clinical trials)',
  },
  'dsip': {
    name: 'DSIP',
    category: 'Sleep',
    benefits: ['Deep sleep', 'Sleep quality', 'Stress reduction'],
    dosing: '100-200mcg before bed',
    timing: '30 min before sleep',
    research: 'Moderate',
  },
  'kisspeptin': {
    name: 'Kisspeptin',
    category: 'Sexual Health',
    benefits: ['Reproductive hormones', 'Libido', 'Fertility support'],
    dosing: '0.5-1mg as needed',
    timing: '30-60 min before',
    research: 'Moderate',
  },
  'mots-c': {
    name: 'MOTS-c',
    category: 'Metabolic',
    benefits: ['Metabolic health', 'Exercise mimetic', 'Fat loss'],
    dosing: '5-10mg 3x weekly',
    timing: 'Morning, fasted',
    research: 'Emerging',
  },
  'humanin': {
    name: 'Humanin',
    category: 'Mitochondrial',
    benefits: ['Neuroprotection', 'Cell survival', 'Anti-aging'],
    dosing: '1-5mg weekly',
    timing: 'Any time',
    research: 'Emerging',
  },
  '5-amino-1mq': {
    name: '5-Amino 1MQ',
    category: 'Metabolic',
    benefits: ['Fat metabolism', 'NNMT inhibition', 'Energy'],
    dosing: '50-150mg daily (oral)',
    timing: 'Morning with food',
    research: 'Emerging',
  },
  'p21': {
    name: 'P21',
    category: 'Cognitive',
    benefits: ['Neurogenesis', 'CNTF mimetic', 'Memory'],
    dosing: '50-100mcg daily',
    timing: 'Morning',
    research: 'Early',
  },
  'na-selank': {
    name: 'NA-Selank',
    category: 'Cognitive',
    benefits: ['Enhanced Selank', 'Anxiety relief', 'Better bioavailability'],
    dosing: '200-400mcg daily (nasal)',
    timing: 'Morning or as needed',
    research: 'Moderate',
  },
  'ghrp-6': {
    name: 'GHRP-6',
    category: 'Performance',
    benefits: ['Strong GH release', 'Appetite increase', 'Recovery'],
    dosing: '100-300mcg 2-3x daily',
    timing: 'Fasted, pre-bed',
    research: 'Strong',
  },
  'ghrp-2': {
    name: 'GHRP-2',
    category: 'Performance',
    benefits: ['GH release', 'Less appetite effect', 'Recovery'],
    dosing: '100-300mcg 2-3x daily',
    timing: 'Fasted, pre-bed',
    research: 'Strong',
  },
  'sr9009': {
    name: 'SR9009',
    category: 'Metabolic',
    benefits: ['Endurance', 'Fat loss', 'Rev-ErbA agonist'],
    dosing: '10-30mg daily (oral)',
    timing: 'Morning or pre-workout',
    research: 'Moderate',
  },
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Healing': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
  'Weight Loss': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
  'Performance': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'Cognitive': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'Anti-Aging': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  'Immune': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  'Sexual Health': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  'Mitochondrial': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Sleep': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  'Metabolic': 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300 border-lime-200 dark:border-lime-800',
}

interface PeptidePillProps {
  name: string
  onAddToStack?: (peptideId: string) => void
  onLearnMore?: (message: string) => void
}

export function PeptidePill({ name, onAddToStack, onLearnMore }: PeptidePillProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'above' | 'below'>('below')
  const pillRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Normalize the peptide name to find in database
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
  const peptideInfo = PEPTIDE_DATABASE[normalizedName]

  // If we don't have info for this peptide, just render the name styled
  if (!peptideInfo) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm">
        <Beaker className="h-3 w-3" />
        {name}
      </span>
    )
  }

  const categoryColor = CATEGORY_COLORS[peptideInfo.category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'

  // Calculate position when opening
  const handleOpen = () => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setPosition(spaceBelow < 300 && spaceAbove > spaceBelow ? 'above' : 'below')
    }
    setIsOpen(true)
  }

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        pillRef.current &&
        !pillRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <span className="relative inline-block">
      <button
        ref={pillRef}
        onClick={handleOpen}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium border transition-all",
          "hover:shadow-md hover:scale-105 cursor-pointer",
          categoryColor
        )}
      >
        <Beaker className="h-3 w-3" />
        {peptideInfo.name}
        <Sparkles className="h-2.5 w-2.5 opacity-60" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={cn(
            "absolute z-50 w-72 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700",
            "bg-white dark:bg-slate-800 animate-in fade-in-0 zoom-in-95 duration-150",
            position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2',
            "left-1/2 -translate-x-1/2"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {peptideInfo.name}
                <span className={cn("text-xs px-2 py-0.5 rounded-full", categoryColor)}>
                  {peptideInfo.category}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Research: {peptideInfo.research}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Benefits */}
          <div className="mb-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Benefits</p>
            <div className="flex flex-wrap gap-1">
              {peptideInfo.benefits.map((benefit, i) => (
                <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Dosing & Timing */}
          <div className="grid grid-cols-2 gap-2 mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Dosing</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{peptideInfo.dosing}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Timing</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{peptideInfo.timing}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onAddToStack?.(normalizedName)
                setIsOpen(false)
              }}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add to Stack
            </button>
            <button
              onClick={() => {
                const message = `Tell me more about ${peptideInfo.name}`
                if (onLearnMore) {
                  onLearnMore(message)
                } else {
                  // Fallback: navigate to chat if no callback provided
                  window.location.href = `/chat?q=${encodeURIComponent(message)}`
                }
                setIsOpen(false)
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      )}
    </span>
  )
}

// List of peptide name patterns to detect (32 peptides with variants)
export const PEPTIDE_PATTERNS = [
  // Healing
  'BPC-157', 'BPC157',
  'TB-500', 'TB500',
  'GHK-Cu', 'GHK Cu',
  'KPV',
  'Larazotide',
  // Weight Loss / Metabolic
  'Semaglutide', 'Ozempic', 'Wegovy',
  'Tirzepatide', 'Mounjaro', 'Zepbound',
  'AOD-9604', 'AOD9604',
  'MOTS-c', 'MOTSc',
  '5-Amino-1MQ', '5-Amino 1MQ', '5Amino1MQ',
  'SR9009', 'SR-9009', 'Stenabolic',
  // Performance
  'Ipamorelin',
  'CJC-1295', 'CJC1295',
  'MK-677', 'MK677', 'Ibutamoren',
  'Tesamorelin',
  'GHRP-6', 'GHRP6',
  'GHRP-2', 'GHRP2',
  // Cognitive
  'Semax',
  'Selank',
  'NA-Selank',
  'Dihexa',
  'P21',
  // Sleep
  'DSIP',
  // Anti-Aging
  'Epithalon', 'Epitalon',
  // Immune
  'Thymosin Alpha-1', 'Thymosin Alpha 1', 'TA1',
  'LL-37', 'LL37',
  // Sexual Health
  'PT-141', 'PT141', 'Bremelanotide',
  'Kisspeptin',
  // Mitochondrial
  'SS-31', 'SS31', 'Elamipretide',
  'NAD+', 'NAD+ IM',
  'Humanin',
]

// Create a regex pattern for all peptides
export const PEPTIDE_REGEX = new RegExp(
  `\\b(${PEPTIDE_PATTERNS.map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`,
  'gi'
)
