'use client'

import { useState } from 'react'
import {
  FlaskConical, Star, Clock, Syringe, BookOpen,
  TrendingUp, AlertCircle, Check, X, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Detailed peptide data for comparison - expanded database
const PEPTIDE_DETAILS: Record<string, {
  name: string
  category: string
  description: string
  benefits: string[]
  dosing: { range: string; frequency: string; duration: string }
  timing: string
  research: { level: 'strong' | 'moderate' | 'limited'; studies: number; notes: string }
  sideEffects: string[]
  costLevel: 'low' | 'medium' | 'high'
  popularity: number
  userRating: number
}> = {
  // HEALING
  'bpc-157': {
    name: 'BPC-157',
    category: 'Healing',
    description: 'Body Protection Compound, a pentadecapeptide derived from gastric juice. Extensively studied for tissue healing and gut repair.',
    benefits: ['Accelerates wound healing', 'Gut healing & protection', 'Tendon/ligament repair', 'Anti-inflammatory', 'Neuroprotective effects'],
    dosing: { range: '250-500mcg', frequency: '1-2x daily', duration: '4-12 weeks' },
    timing: 'Can be taken any time; some prefer split doses AM/PM near injury site',
    research: { level: 'moderate', studies: 100, notes: 'Mostly animal studies, strong anecdotal human evidence' },
    sideEffects: ['Generally well tolerated', 'Occasional nausea', 'Dizziness (rare)'],
    costLevel: 'medium',
    popularity: 5,
    userRating: 4.7,
  },
  'tb-500': {
    name: 'TB-500',
    category: 'Healing',
    description: 'Thymosin Beta-4 fragment, promotes healing through cell migration and blood vessel growth.',
    benefits: ['Wound healing', 'Muscle repair', 'Improved flexibility', 'Reduced inflammation', 'Hair regrowth (some reports)'],
    dosing: { range: '2-5mg', frequency: '2x weekly', duration: '4-6 weeks loading, then maintenance' },
    timing: 'Any time of day; consistency matters more than timing',
    research: { level: 'moderate', studies: 50, notes: 'Good animal data, growing human evidence' },
    sideEffects: ['Head rush', 'Tiredness', 'Flu-like symptoms (rare)'],
    costLevel: 'high',
    popularity: 4,
    userRating: 4.3,
  },
  'ghk-cu': {
    name: 'GHK-Cu',
    category: 'Healing',
    description: 'Copper tripeptide with remarkable wound healing and anti-aging properties.',
    benefits: ['Skin regeneration', 'Wound healing', 'Collagen synthesis', 'Anti-aging', 'Hair growth'],
    dosing: { range: '1-2mg', frequency: 'Daily or topical', duration: '4-8 weeks' },
    timing: 'Any time; topical application for skin benefits',
    research: { level: 'moderate', studies: 70, notes: '70+ studies on wound healing and skin regeneration' },
    sideEffects: ['Very well tolerated', 'Skin irritation (topical, rare)'],
    costLevel: 'medium',
    popularity: 3,
    userRating: 4.2,
  },

  // WEIGHT LOSS
  'semaglutide': {
    name: 'Semaglutide',
    category: 'Weight Loss',
    description: 'GLP-1 receptor agonist that reduces appetite and slows gastric emptying. FDA approved for weight loss.',
    benefits: ['Significant weight loss (15-20%)', 'Reduced appetite', 'Better blood sugar control', 'Cardiovascular benefits', 'Reduced food noise'],
    dosing: { range: '0.25-2.4mg', frequency: 'Weekly', duration: 'Ongoing; slow titration up' },
    timing: 'Same day each week; with or without food',
    research: { level: 'strong', studies: 500, notes: 'FDA approved, extensive clinical trials (STEP trials)' },
    sideEffects: ['Nausea (common initially)', 'Constipation', 'Diarrhea', 'Fatigue', 'Gallbladder issues (rare)'],
    costLevel: 'high',
    popularity: 5,
    userRating: 4.5,
  },
  'tirzepatide': {
    name: 'Tirzepatide',
    category: 'Weight Loss',
    description: 'Dual GLP-1/GIP receptor agonist with superior weight loss efficacy. FDA approved.',
    benefits: ['Superior weight loss (20-25%)', 'Dual hormone action', 'Blood sugar control', 'Cardiovascular benefits'],
    dosing: { range: '2.5-15mg', frequency: 'Weekly', duration: 'Ongoing; slow titration' },
    timing: 'Same day each week',
    research: { level: 'strong', studies: 400, notes: 'FDA approved. SURMOUNT trials showed superior efficacy' },
    sideEffects: ['Nausea', 'Diarrhea', 'Constipation', 'Injection site reactions'],
    costLevel: 'high',
    popularity: 5,
    userRating: 4.6,
  },
  'aod-9604': {
    name: 'AOD-9604',
    category: 'Weight Loss',
    description: 'Modified HGH fragment (176-191) that targets fat cells without IGF-1 effects.',
    benefits: ['Fat burning', 'Lipolysis', 'No blood sugar effects', 'Cartilage repair potential'],
    dosing: { range: '300-500mcg', frequency: 'Daily', duration: '8-12 weeks' },
    timing: 'Morning, fasted for best results',
    research: { level: 'moderate', studies: 30, notes: 'Modified GH fragment, good safety profile' },
    sideEffects: ['Generally well tolerated', 'Injection site reactions'],
    costLevel: 'medium',
    popularity: 3,
    userRating: 3.9,
  },
  '5-amino-1mq': {
    name: '5-Amino-1MQ',
    category: 'Weight Loss',
    description: 'NNMT inhibitor that prevents fat cell formation and boosts NAD+ levels.',
    benefits: ['Metabolic boost', 'Fat cell reduction', 'Energy increase', 'Muscle preservation', 'NAD+ boost'],
    dosing: { range: '50-150mg', frequency: 'Daily (oral)', duration: '8-12 weeks' },
    timing: 'Morning with or without food',
    research: { level: 'moderate', studies: 20, notes: 'Novel mechanism, promising early research' },
    sideEffects: ['Well tolerated', 'Headache (rare)', 'GI discomfort (rare)'],
    costLevel: 'medium',
    popularity: 3,
    userRating: 4.0,
  },

  // PERFORMANCE
  'sr9009': {
    name: 'SR9009 (Stenabolic)',
    category: 'Performance',
    description: 'Rev-ErbA agonist that enhances metabolic activity and circadian rhythm function.',
    benefits: ['Endurance boost', 'Fat oxidation', 'Mitochondrial biogenesis', 'Circadian rhythm support'],
    dosing: { range: '10-30mg', frequency: 'Daily (split doses)', duration: '8-12 weeks' },
    timing: 'Morning and pre-workout; split due to short half-life',
    research: { level: 'moderate', studies: 25, notes: 'Strong animal data, limited human studies' },
    sideEffects: ['Generally well tolerated', 'Insomnia if taken late', 'Wakefulness'],
    costLevel: 'medium',
    popularity: 3,
    userRating: 4.0,
  },
  'cardarine': {
    name: 'GW501516 (Cardarine)',
    category: 'Performance',
    description: 'PPARδ agonist known for dramatic endurance enhancement and fat burning.',
    benefits: ['Massive endurance increase', 'Fat burning', 'Lipid profile improvement', 'Recovery enhancement'],
    dosing: { range: '10-20mg', frequency: 'Daily', duration: '8-12 weeks' },
    timing: 'Morning or pre-workout',
    research: { level: 'moderate', studies: 40, notes: 'Note: cancer concerns in rat studies at high doses' },
    sideEffects: ['Well tolerated short-term', 'Long-term safety uncertain', 'Potential cancer risk (high doses)'],
    costLevel: 'medium',
    popularity: 4,
    userRating: 4.3,
  },
  'mk-677': {
    name: 'MK-677 (Ibutamoren)',
    category: 'Performance',
    description: 'Oral growth hormone secretagogue with 24-hour half-life for sustained GH/IGF-1 elevation.',
    benefits: ['GH release', 'Sleep improvement', 'Muscle growth', 'Recovery', 'Appetite increase'],
    dosing: { range: '10-25mg', frequency: 'Daily', duration: 'Ongoing or cycled' },
    timing: 'Before bed for best sleep benefits',
    research: { level: 'strong', studies: 100, notes: 'Well-studied oral GH secretagogue' },
    sideEffects: ['Increased appetite', 'Water retention', 'Numbness/tingling', 'Blood sugar effects'],
    costLevel: 'medium',
    popularity: 5,
    userRating: 4.4,
  },
  'cjc-1295': {
    name: 'CJC-1295',
    category: 'Performance',
    description: 'GHRH analog that stimulates natural growth hormone release. Available with or without DAC.',
    benefits: ['Sustained GH release', 'Recovery enhancement', 'Sleep quality', 'Fat loss', 'Muscle growth'],
    dosing: { range: '100-300mcg', frequency: 'Daily or 1-2mg weekly (DAC)', duration: '8-12 weeks' },
    timing: 'Before bed on empty stomach',
    research: { level: 'moderate', studies: 30, notes: 'Well-studied GHRH analog, DAC version has 8-day half-life' },
    sideEffects: ['Water retention', 'Numbness/tingling', 'Tiredness', 'Increased hunger'],
    costLevel: 'medium',
    popularity: 4,
    userRating: 4.2,
  },
  'ipamorelin': {
    name: 'Ipamorelin',
    category: 'Performance',
    description: 'Selective growth hormone secretagogue that stimulates GH release without affecting cortisol.',
    benefits: ['Clean GH release', 'No cortisol spike', 'Anti-aging effects', 'Better sleep', 'Recovery enhancement'],
    dosing: { range: '100-300mcg', frequency: '2-3x daily', duration: '8-12 weeks' },
    timing: 'On empty stomach; morning, post-workout, and before bed',
    research: { level: 'moderate', studies: 25, notes: 'Cleanest GHRP with minimal side effects' },
    sideEffects: ['Head rush', 'Hunger increase', 'Water retention (mild)'],
    costLevel: 'medium',
    popularity: 4,
    userRating: 4.4,
  },
  'tesamorelin': {
    name: 'Tesamorelin',
    category: 'Performance',
    description: 'FDA-approved GHRH analog known for visceral fat reduction and cognitive benefits.',
    benefits: ['Visceral fat reduction', 'GH release', 'Cognitive improvement', 'Lipid profile improvement'],
    dosing: { range: '1-2mg', frequency: 'Daily', duration: 'Ongoing' },
    timing: 'Before bed, fasted',
    research: { level: 'strong', studies: 80, notes: 'FDA approved for HIV lipodystrophy' },
    sideEffects: ['Injection site reactions', 'Joint pain', 'Swelling'],
    costLevel: 'high',
    popularity: 3,
    userRating: 4.3,
  },

  // COGNITIVE
  'selank': {
    name: 'Selank',
    category: 'Cognitive',
    description: 'Synthetic peptide derived from tuftsin, developed in Russia for anxiety and cognitive enhancement.',
    benefits: ['Anxiety reduction', 'Improved focus', 'Memory enhancement', 'Mood stabilization', 'No sedation'],
    dosing: { range: '250-500mcg', frequency: '1-2x daily', duration: '2-4 weeks cycles' },
    timing: 'Morning; nasal spray is common ROA',
    research: { level: 'moderate', studies: 40, notes: 'Approved in Russia, researched for anxiety' },
    sideEffects: ['Generally very well tolerated', 'Fatigue (rare)', 'Nasal irritation (spray)'],
    costLevel: 'low',
    popularity: 3,
    userRating: 4.1,
  },
  'semax': {
    name: 'Semax',
    category: 'Cognitive',
    description: 'ACTH analog that increases BDNF and provides neuroprotection without hormonal effects.',
    benefits: ['Focus enhancement', 'BDNF increase', 'Neuroprotection', 'Memory improvement', 'Stroke recovery'],
    dosing: { range: '200-600mcg', frequency: 'Daily', duration: '2-4 weeks cycles' },
    timing: 'Morning; nasal spray preferred',
    research: { level: 'moderate', studies: 50, notes: 'ACTH analog, approved in Russia for stroke recovery' },
    sideEffects: ['Very well tolerated', 'Nasal irritation', 'Hair loss (rare, high doses)'],
    costLevel: 'low',
    popularity: 3,
    userRating: 4.2,
  },
  'dihexa': {
    name: 'Dihexa',
    category: 'Cognitive',
    description: 'Potent HGF mimetic reported to be millions of times more potent than BDNF for synapse formation.',
    benefits: ['Cognitive enhancement', 'Memory formation', 'Synaptogenesis', 'Neuroprotection'],
    dosing: { range: '10-40mg', frequency: 'Daily (oral)', duration: '4-8 weeks' },
    timing: 'Morning',
    research: { level: 'limited', studies: 10, notes: 'Extremely potent in studies, limited human data' },
    sideEffects: ['Unknown long-term', 'Headache (reported)', 'Limited safety data'],
    costLevel: 'high',
    popularity: 2,
    userRating: 4.0,
  },

  // ANTI-AGING
  'epithalon': {
    name: 'Epithalon',
    category: 'Anti-Aging',
    description: 'Tetrapeptide that activates telomerase for potential longevity benefits.',
    benefits: ['Telomere support', 'Sleep improvement', 'Melatonin regulation', 'Longevity potential'],
    dosing: { range: '5-10mg', frequency: 'Daily for 10-20 days', duration: 'Cycled' },
    timing: 'Evening',
    research: { level: 'moderate', studies: 30, notes: 'Russian research showed lifespan increase in animals' },
    sideEffects: ['Generally well tolerated', 'Injection site reactions'],
    costLevel: 'medium',
    popularity: 3,
    userRating: 4.1,
  },
  'ss-31': {
    name: 'SS-31 (Elamipretide)',
    category: 'Anti-Aging',
    description: 'Mitochondria-targeted peptide that repairs cellular energy production.',
    benefits: ['Mitochondrial function', 'Energy production', 'Cardioprotection', 'Anti-aging'],
    dosing: { range: '5-50mg', frequency: 'Daily', duration: '8-12 weeks' },
    timing: 'Morning',
    research: { level: 'strong', studies: 60, notes: 'Phase 3 trials for mitochondrial myopathy' },
    sideEffects: ['Well tolerated', 'Injection site reactions'],
    costLevel: 'high',
    popularity: 2,
    userRating: 4.0,
  },

  // IMMUNE
  'thymosin-alpha-1': {
    name: 'Thymosin Alpha-1',
    category: 'Immune',
    description: 'Thymic peptide that enhances T-cell and NK cell function. FDA approved in other countries.',
    benefits: ['Immune boost', 'Infection resistance', 'Cancer adjunct therapy', 'Chronic fatigue support'],
    dosing: { range: '1.6mg', frequency: '2-3x weekly', duration: 'Ongoing or as needed' },
    timing: 'Morning',
    research: { level: 'strong', studies: 100, notes: 'FDA approved in 35+ countries' },
    sideEffects: ['Very well tolerated', 'Injection site reactions'],
    costLevel: 'high',
    popularity: 3,
    userRating: 4.3,
  },

  // SEXUAL HEALTH
  'pt-141': {
    name: 'PT-141 (Bremelanotide)',
    category: 'Sexual Health',
    description: 'FDA-approved melanocortin agonist that works via brain receptors for sexual function.',
    benefits: ['Libido enhancement', 'Sexual function improvement', 'Works for both sexes', 'Non-vascular mechanism'],
    dosing: { range: '1-2mg', frequency: 'As needed', duration: 'N/A' },
    timing: '45-60 minutes before activity',
    research: { level: 'strong', studies: 50, notes: 'FDA approved for HSDD in women' },
    sideEffects: ['Nausea', 'Flushing', 'Headache', 'Blood pressure changes'],
    costLevel: 'medium',
    popularity: 4,
    userRating: 4.2,
  },
}

interface CompareViewProps {
  peptideIds?: string[]
}

export function CompareView({ peptideIds = [] }: CompareViewProps) {
  const [selected, setSelected] = useState<string[]>(peptideIds.slice(0, 3))
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['benefits', 'dosing']))

  const availablePeptides = Object.keys(PEPTIDE_DETAILS)

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections)
    if (next.has(section)) {
      next.delete(section)
    } else {
      next.add(section)
    }
    setExpandedSections(next)
  }

  const addPeptide = (id: string) => {
    if (selected.length < 3 && !selected.includes(id)) {
      setSelected([...selected, id])
    }
  }

  const removePeptide = (id: string) => {
    setSelected(selected.filter(p => p !== id))
  }

  const selectedData = selected.map(id => PEPTIDE_DETAILS[id]).filter(Boolean)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
            )}
          />
        ))}
        <span className="ml-1 text-xs text-slate-500">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const renderResearchBadge = (level: string) => {
    const colors = {
      strong: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      limited: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[level as keyof typeof colors])}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    )
  }

  const renderCostBadge = (level: string) => {
    const labels = { low: '$', medium: '$$', high: '$$$' }
    const colors = {
      low: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-red-600 dark:text-red-400',
    }
    return (
      <span className={cn("font-bold", colors[level as keyof typeof colors])}>
        {labels[level as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="p-4">
      {/* Selection Row */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          Select up to 3 peptides to compare:
        </h3>
        <div className="flex flex-wrap gap-2">
          {availablePeptides.map(id => {
            const peptide = PEPTIDE_DETAILS[id]
            const isSelected = selected.includes(id)
            return (
              <button
                key={id}
                onClick={() => isSelected ? removePeptide(id) : addPeptide(id)}
                disabled={!isSelected && selected.length >= 3}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                )}
              >
                {peptide.name}
                {isSelected && <X className="inline h-3 w-3 ml-1" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {selected.length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid gap-px bg-slate-200 dark:bg-slate-700" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 font-medium text-slate-500 dark:text-slate-400">
              Compare
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-4 text-center">
                <div className="font-semibold text-slate-900 dark:text-white">{peptide.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{peptide.category}</div>
                <div className="mt-1">{renderStars(peptide.userRating)}</div>
              </div>
            ))}
          </div>

          {/* Description Row */}
          <div className="grid gap-px bg-slate-200 dark:bg-slate-700" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300 text-sm">
              Description
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3 text-sm text-slate-600 dark:text-slate-300">
                {peptide.description}
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div
            className="grid gap-px bg-slate-200 dark:bg-slate-700 cursor-pointer"
            style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
            onClick={() => toggleSection('benefits')}
          >
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Benefits
              <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", expandedSections.has('benefits') && "rotate-180")} />
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3">
                {expandedSections.has('benefits') ? (
                  <ul className="space-y-1">
                    {peptide.benefits.map(b => (
                      <li key={b} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1">
                        <Check className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-slate-500">{peptide.benefits.length} benefits</span>
                )}
              </div>
            ))}
          </div>

          {/* Dosing Section */}
          <div
            className="grid gap-px bg-slate-200 dark:bg-slate-700 cursor-pointer"
            style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
            onClick={() => toggleSection('dosing')}
          >
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Dosing
              <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", expandedSections.has('dosing') && "rotate-180")} />
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3">
                {expandedSections.has('dosing') ? (
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium text-slate-500">Dose:</span> <span className="text-slate-700 dark:text-slate-300">{peptide.dosing.range}</span></div>
                    <div><span className="font-medium text-slate-500">Frequency:</span> <span className="text-slate-700 dark:text-slate-300">{peptide.dosing.frequency}</span></div>
                    <div><span className="font-medium text-slate-500">Duration:</span> <span className="text-slate-700 dark:text-slate-300">{peptide.dosing.duration}</span></div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-600 dark:text-slate-300">{peptide.dosing.range}</span>
                )}
              </div>
            ))}
          </div>

          {/* Timing Row */}
          <div className="grid gap-px bg-slate-200 dark:bg-slate-700" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Best Timing
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3 text-sm text-slate-600 dark:text-slate-300">
                {peptide.timing}
              </div>
            ))}
          </div>

          {/* Research Row */}
          <div className="grid gap-px bg-slate-200 dark:bg-slate-700" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Research
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3">
                <div className="flex items-center gap-2 mb-1">
                  {renderResearchBadge(peptide.research.level)}
                  <span className="text-xs text-slate-500">{peptide.research.studies}+ studies</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{peptide.research.notes}</p>
              </div>
            ))}
          </div>

          {/* Side Effects Section */}
          <div
            className="grid gap-px bg-slate-200 dark:bg-slate-700 cursor-pointer"
            style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
            onClick={() => toggleSection('sideEffects')}
          >
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Side Effects
              <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", expandedSections.has('sideEffects') && "rotate-180")} />
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3">
                {expandedSections.has('sideEffects') ? (
                  <ul className="space-y-1">
                    {peptide.sideEffects.map(s => (
                      <li key={s} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1">
                        <span className="text-amber-500">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-slate-500">{peptide.sideEffects.length} noted</span>
                )}
              </div>
            ))}
          </div>

          {/* Cost Row */}
          <div className="grid gap-px bg-slate-200 dark:bg-slate-700" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300">
              Cost Level
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3 text-center">
                {renderCostBadge(peptide.costLevel)}
              </div>
            ))}
          </div>

          {/* Popularity Row */}
          <div className="grid gap-px bg-slate-200 dark:bg-slate-700" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 font-medium text-slate-700 dark:text-slate-300">
              Popularity
            </div>
            {selectedData.map(peptide => (
              <div key={peptide.name} className="bg-white dark:bg-slate-900 p-3 text-center">
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-4 rounded-sm",
                        i <= peptide.popularity
                          ? "bg-blue-500"
                          : "bg-slate-200 dark:bg-slate-700"
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Select peptides above to compare</p>
          <p className="text-sm mt-1">Choose up to 3 for side-by-side comparison</p>
        </div>
      )}
    </div>
  )
}
