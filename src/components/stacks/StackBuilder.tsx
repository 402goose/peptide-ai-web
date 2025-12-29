'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Plus, X, Zap, AlertTriangle, Check, ArrowRight,
  Clock, FlaskConical, MessageSquare, Sparkles, Lightbulb,
  Search, BadgeCheck, Beaker, HelpCircle, Share2, Copy, CheckCircle,
  Pill, Target, Activity, Flame, Brain, Moon, Shield, Heart, Dumbbell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  trackStackGoalSelected,
  trackStackPeptideAdded,
  trackStackPeptideRemoved,
  trackStackShared,
  trackStackAskAI,
  trackStackStartJourney,
} from '@/lib/analytics'
import { VendorRecommendations } from '@/components/vendors/VendorRecommendations'

// Types for custom peptides
interface CustomPeptide {
  id: string
  name: string
  category: string
  benefits: string[]
  dosing: string
  timing: string
  research: 'strong' | 'moderate' | 'limited' | 'unknown'
  synergies: string[]
  conflicts: string[]
  researchNotes: string
  isCustom: true
  tags: Array<'fda-approved' | 'clinical-trials' | 'research-only' | 'user-added'>
  helpsWithSymptoms?: string[]
  sideEffects?: string[]
}

type Peptide = {
  id: string
  name: string
  category: string
  benefits: string[]
  dosing: string
  timing: string
  research: string
  synergies: string[]
  conflicts: string[]
  researchNotes: string
  isCustom?: boolean
  tags?: Array<'fda-approved' | 'clinical-trials' | 'research-only' | 'user-added'>
  helpsWithSymptoms: string[]
  sideEffects: string[]
}

// Symptom categories that users might want to address
const SYMPTOM_CATEGORIES = [
  { id: 'fat-loss', label: 'Fat Loss', icon: Flame, color: 'text-orange-500' },
  { id: 'muscle', label: 'Muscle & Recovery', icon: Dumbbell, color: 'text-blue-500' },
  { id: 'healing', label: 'Injury Healing', icon: Shield, color: 'text-red-500' },
  { id: 'energy', label: 'Energy & Endurance', icon: Activity, color: 'text-yellow-500' },
  { id: 'cognitive', label: 'Focus & Memory', icon: Brain, color: 'text-purple-500' },
  { id: 'sleep', label: 'Sleep Quality', icon: Moon, color: 'text-indigo-500' },
  { id: 'longevity', label: 'Anti-Aging', icon: Heart, color: 'text-pink-500' },
  { id: 'immune', label: 'Immune Support', icon: Shield, color: 'text-teal-500' },
]

// Comprehensive peptide database with symptoms and side effects
const PEPTIDES: Peptide[] = [
  // HEALING
  {
    id: 'bpc-157',
    name: 'BPC-157',
    category: 'healing',
    benefits: ['Gut healing', 'Tissue repair', 'Anti-inflammatory', 'Tendon/ligament repair'],
    dosing: '250-500mcg 1-2x daily',
    timing: 'Morning or split AM/PM, inject near injury site for local healing',
    research: 'strong',
    synergies: ['tb-500', 'ghk-cu', 'pentadecapeptide'],
    conflicts: [],
    researchNotes: '100+ animal studies showing accelerated healing. Commonly used for injuries. Works by promoting blood vessel formation and collagen production.',
    helpsWithSymptoms: ['healing', 'gut-issues', 'inflammation', 'tendon-pain', 'joint-pain'],
    sideEffects: ['Injection site discomfort', 'Mild nausea (rare)', 'Dizziness (rare)'],
  },
  {
    id: 'tb-500',
    name: 'TB-500',
    category: 'healing',
    benefits: ['Wound healing', 'Flexibility', 'Hair growth', 'Muscle repair'],
    dosing: '2-5mg 2x weekly (loading), then 2mg weekly (maintenance)',
    timing: 'Any time, works systemically',
    research: 'moderate',
    synergies: ['bpc-157', 'ghk-cu'],
    conflicts: [],
    researchNotes: 'Thymosin Beta-4 fragment. Promotes cell migration and angiogenesis. Works well for chronic injuries.',
    helpsWithSymptoms: ['healing', 'flexibility', 'hair-loss', 'muscle-injury'],
    sideEffects: ['Headache', 'Temporary lethargy', 'Injection site irritation'],
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    category: 'healing',
    benefits: ['Skin health', 'Wound healing', 'Collagen synthesis', 'Anti-aging'],
    dosing: '1-2mg daily injectable or topical (cream/serum)',
    timing: 'Any time, evening for skin benefits',
    research: 'moderate',
    synergies: ['bpc-157', 'tb-500', 'epithalon'],
    conflicts: [],
    researchNotes: 'Copper peptide with 70+ studies. Activates genes involved in wound healing and tissue remodeling.',
    helpsWithSymptoms: ['healing', 'skin-aging', 'wrinkles', 'scars', 'longevity'],
    sideEffects: ['Skin irritation (topical)', 'Injection site reaction'],
  },

  // WEIGHT LOSS / METABOLIC
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    category: 'weight',
    benefits: ['Weight loss (15-20%)', 'Appetite control', 'Blood sugar regulation', 'Cardiovascular benefits'],
    dosing: 'Start 0.25mg weekly, titrate up to 2.4mg over 16-20 weeks',
    timing: 'Same day each week, any time (be consistent)',
    research: 'strong',
    synergies: ['5-amino-1mq', 'aod-9604', 'sr9009', 'tesofensine'],
    conflicts: ['tirzepatide'],
    researchNotes: 'FDA approved (Ozempic/Wegovy). STEP trials showed 15-20% weight loss. GLP-1 agonist that reduces appetite and slows gastric emptying.',
    helpsWithSymptoms: ['fat-loss', 'appetite', 'blood-sugar', 'metabolic-syndrome'],
    sideEffects: ['Nausea (common initially)', 'Vomiting', 'Diarrhea', 'Constipation', 'Fatigue', 'Injection site reaction'],
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'weight',
    benefits: ['Superior weight loss (20-25%)', 'Dual GLP-1/GIP action', 'Blood sugar control'],
    dosing: 'Start 2.5mg weekly, titrate to 15mg over 20 weeks',
    timing: 'Same day each week, any time',
    research: 'strong',
    synergies: ['5-amino-1mq', 'aod-9604', 'sr9009'],
    conflicts: ['semaglutide'],
    researchNotes: 'FDA approved (Mounjaro/Zepbound). SURMOUNT trials showed superior weight loss to semaglutide. Dual agonist mechanism.',
    helpsWithSymptoms: ['fat-loss', 'appetite', 'blood-sugar', 'metabolic-syndrome'],
    sideEffects: ['Nausea', 'Diarrhea', 'Decreased appetite', 'Vomiting', 'Constipation', 'Abdominal pain'],
  },
  {
    id: 'aod-9604',
    name: 'AOD-9604',
    category: 'weight',
    benefits: ['Fat burning', 'Lipolysis', 'No effect on blood sugar', 'Cartilage repair'],
    dosing: '300-500mcg daily',
    timing: 'Morning, fasted (30-60 min before food)',
    research: 'moderate',
    synergies: ['semaglutide', 'tirzepatide', 'cjc-1295', 'ipamorelin'],
    conflicts: [],
    researchNotes: 'Modified HGH fragment (176-191). Targets fat cells specifically without IGF-1 effects. No impact on glucose or insulin.',
    helpsWithSymptoms: ['fat-loss', 'stubborn-fat', 'joint-repair'],
    sideEffects: ['Injection site irritation', 'Headache (rare)'],
  },
  {
    id: '5-amino-1mq',
    name: '5-Amino-1MQ',
    category: 'weight',
    benefits: ['Metabolic boost', 'Fat cell reduction', 'Energy increase', 'Muscle preservation'],
    dosing: '50-150mg daily (oral capsule)',
    timing: 'Morning with or without food',
    research: 'moderate',
    synergies: ['semaglutide', 'tirzepatide', 'sr9009'],
    conflicts: [],
    researchNotes: 'NNMT inhibitor. Prevents fat cell accumulation and boosts NAD+ levels. Novel mechanism different from traditional fat burners.',
    helpsWithSymptoms: ['fat-loss', 'energy', 'metabolic-boost'],
    sideEffects: ['Mild GI upset', 'Headache (rare)'],
  },
  {
    id: 'sr9009',
    name: 'SR9009 (Stenabolic)',
    category: 'performance',
    benefits: ['Endurance boost', 'Fat oxidation', 'Mitochondrial biogenesis', 'Circadian rhythm support'],
    dosing: '10-30mg daily split into 2-3 doses (short half-life)',
    timing: 'Morning and pre-workout (or every 4-6 hours)',
    research: 'moderate',
    synergies: ['semaglutide', 'cardarine', 'aod-9604'],
    conflicts: [],
    researchNotes: 'Rev-ErbA agonist. Enhances metabolic activity and endurance. Very short half-life (~4 hours) requires multiple doses.',
    helpsWithSymptoms: ['fat-loss', 'energy', 'endurance', 'circadian-rhythm'],
    sideEffects: ['Insomnia (if taken late)', 'Decreased appetite'],
  },

  // PERFORMANCE / GH
  {
    id: 'mk-677',
    name: 'MK-677 (Ibutamoren)',
    category: 'performance',
    benefits: ['GH release', 'Sleep improvement', 'Muscle growth', 'Recovery', 'Appetite increase'],
    dosing: '10-25mg daily (oral)',
    timing: 'Before bed (enhances sleep, manages hunger)',
    research: 'strong',
    synergies: ['cjc-1295', 'ipamorelin', 'bpc-157'],
    conflicts: [],
    researchNotes: 'Oral GH secretagogue with 24-hour half-life. Sustained GH/IGF-1 increase. May increase cortisol and prolactin slightly.',
    helpsWithSymptoms: ['sleep', 'muscle', 'recovery', 'appetite-increase', 'longevity'],
    sideEffects: ['Increased hunger', 'Water retention', 'Lethargy initially', 'Numbness/tingling in hands', 'Elevated blood sugar (if predisposed)'],
  },
  {
    id: 'cjc-1295',
    name: 'CJC-1295 (with DAC)',
    category: 'performance',
    benefits: ['Sustained GH release', 'Recovery', 'Sleep quality', 'Fat loss'],
    dosing: '1-2mg weekly (with DAC) or 100-300mcg daily (no DAC/Mod GRF)',
    timing: 'Before bed, fasted (avoid carbs 2-3 hrs prior)',
    research: 'moderate',
    synergies: ['ipamorelin', 'mk-677', 'tesamorelin', 'aod-9604'],
    conflicts: [],
    researchNotes: 'GHRH analog. DAC version has 8-day half-life. Best combined with a GHRP like ipamorelin for synergistic GH pulse.',
    helpsWithSymptoms: ['muscle', 'recovery', 'sleep', 'fat-loss', 'longevity'],
    sideEffects: ['Flushing', 'Headache', 'Water retention', 'Injection site irritation'],
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    category: 'performance',
    benefits: ['Clean GH release', 'No cortisol spike', 'Recovery', 'Anti-aging'],
    dosing: '100-300mcg 2-3x daily',
    timing: 'Fasted (morning, pre-workout, before bed)',
    research: 'moderate',
    synergies: ['cjc-1295', 'mod-grf', 'tesamorelin'],
    conflicts: [],
    researchNotes: 'Selective GHRP with minimal impact on cortisol and prolactin. One of the "cleanest" GH secretagogues available.',
    helpsWithSymptoms: ['muscle', 'recovery', 'longevity', 'fat-loss'],
    sideEffects: ['Headache', 'Flushing', 'Dizziness (rare)'],
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'performance',
    benefits: ['Visceral fat reduction', 'GH release', 'Cognitive benefits', 'Lipid improvement'],
    dosing: '1-2mg daily',
    timing: 'Before bed, fasted',
    research: 'strong',
    synergies: ['ipamorelin', 'cjc-1295'],
    conflicts: [],
    researchNotes: 'FDA approved for HIV lipodystrophy. Significantly reduces visceral (dangerous) belly fat. Also shown to improve cognition.',
    helpsWithSymptoms: ['fat-loss', 'visceral-fat', 'cognitive', 'lipids'],
    sideEffects: ['Injection site reaction', 'Joint pain', 'Muscle pain', 'Peripheral edema'],
  },

  // COGNITIVE
  {
    id: 'selank',
    name: 'Selank',
    category: 'cognitive',
    benefits: ['Anxiety relief', 'Focus', 'Memory', 'Immune modulation'],
    dosing: '250-500mcg daily (nasal spray preferred)',
    timing: 'Morning or when needed for anxiety',
    research: 'moderate',
    synergies: ['semax', 'dihexa', 'p21'],
    conflicts: [],
    researchNotes: 'Russian-developed anxiolytic peptide (Tuftsin analog). Modulates GABA and reduces anxiety without sedation.',
    helpsWithSymptoms: ['anxiety', 'cognitive', 'immune', 'stress'],
    sideEffects: ['Fatigue (rare)', 'Nasal irritation (spray form)'],
  },
  {
    id: 'semax',
    name: 'Semax',
    category: 'cognitive',
    benefits: ['Focus', 'Neuroprotection', 'Memory', 'BDNF increase'],
    dosing: '200-600mcg daily (nasal spray)',
    timing: 'Morning for focus, can redose afternoon',
    research: 'moderate',
    synergies: ['selank', 'dihexa', 'p21'],
    conflicts: [],
    researchNotes: 'ACTH analog without hormonal effects. Increases BDNF and has been used for stroke recovery in Russia.',
    helpsWithSymptoms: ['cognitive', 'focus', 'memory', 'neuroprotection'],
    sideEffects: ['Hair shedding (temporary)', 'Irritability (high doses)', 'Nasal irritation'],
  },
  {
    id: 'dihexa',
    name: 'Dihexa',
    category: 'cognitive',
    benefits: ['Cognitive enhancement', 'Memory formation', 'Neuroprotection', 'Synaptogenesis'],
    dosing: '10-40mg daily (oral or sublingual)',
    timing: 'Morning',
    research: 'limited',
    synergies: ['semax', 'selank', 'p21'],
    conflicts: [],
    researchNotes: 'HGF mimetic. Claimed to be 10 million times more potent than BDNF in promoting synapse formation. Limited human data.',
    helpsWithSymptoms: ['cognitive', 'memory', 'neuroprotection', 'dementia-prevention'],
    sideEffects: ['Unknown long-term effects', 'Headache', 'Research chemical - limited safety data'],
  },

  // ANTI-AGING / LONGEVITY
  {
    id: 'epithalon',
    name: 'Epithalon',
    category: 'antiaging',
    benefits: ['Telomere support', 'Sleep improvement', 'Melatonin regulation', 'Longevity'],
    dosing: '5-10mg daily for 10-20 days, then break (cycle)',
    timing: 'Evening',
    research: 'moderate',
    synergies: ['ghk-cu', 'thymalin', 'ss-31'],
    conflicts: [],
    researchNotes: 'Epithalamin derivative that activates telomerase. Russian research showed increased lifespan in animals. Run in cycles.',
    helpsWithSymptoms: ['longevity', 'sleep', 'aging', 'melatonin-issues'],
    sideEffects: ['Vivid dreams', 'Injection site reaction'],
  },
  {
    id: 'ss-31',
    name: 'SS-31 (Elamipretide)',
    category: 'antiaging',
    benefits: ['Mitochondrial function', 'Energy production', 'Cardioprotection', 'Anti-aging'],
    dosing: '5-50mg daily',
    timing: 'Morning',
    research: 'strong',
    synergies: ['epithalon', 'nad-precursors'],
    conflicts: [],
    researchNotes: 'Targets cardiolipin in mitochondrial inner membrane. Phase 3 trials for mitochondrial myopathy and heart failure.',
    helpsWithSymptoms: ['energy', 'longevity', 'mitochondrial', 'heart-health'],
    sideEffects: ['Injection site reaction', 'Headache'],
  },

  // IMMUNE
  {
    id: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    category: 'immune',
    benefits: ['Immune boost', 'Infection resistance', 'Cancer adjunct', 'Chronic fatigue'],
    dosing: '1.6mg 2-3x weekly',
    timing: 'Morning',
    research: 'strong',
    synergies: ['thymalin', 'bpc-157', 'll-37'],
    conflicts: [],
    researchNotes: 'FDA approved in other countries for immune enhancement. Enhances T-cell and NK cell function. Used with cancer therapy.',
    helpsWithSymptoms: ['immune', 'infection', 'fatigue', 'cancer-support'],
    sideEffects: ['Injection site reaction', 'Fever (immune activation)'],
  },
  {
    id: 'll-37',
    name: 'LL-37',
    category: 'immune',
    benefits: ['Antimicrobial', 'Wound healing', 'Biofilm disruption', 'Immune modulation'],
    dosing: '50-100mcg daily',
    timing: 'Varies by application',
    research: 'moderate',
    synergies: ['thymosin-alpha-1', 'bpc-157'],
    conflicts: [],
    researchNotes: 'Human cathelicidin antimicrobial peptide. Disrupts biofilms and has broad antimicrobial activity.',
    helpsWithSymptoms: ['immune', 'infection', 'healing', 'biofilm-infections'],
    sideEffects: ['Injection site reaction', 'Temporary immune flare'],
  },

  // SEXUAL HEALTH
  {
    id: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    category: 'sexual',
    benefits: ['Libido enhancement', 'Sexual function', 'Works for both sexes'],
    dosing: '1-2mg as needed (max 8 doses/month)',
    timing: '45-60 min before activity',
    research: 'strong',
    synergies: ['kisspeptin'],
    conflicts: [],
    researchNotes: 'FDA approved (Vyleesi). Works via melanocortin receptors in brain, not vascular. Effective for both men and women.',
    helpsWithSymptoms: ['libido', 'sexual-dysfunction', 'arousal'],
    sideEffects: ['Nausea (common)', 'Flushing', 'Headache', 'Skin darkening with repeated use'],
  },
  {
    id: 'kisspeptin',
    name: 'Kisspeptin-10',
    category: 'sexual',
    benefits: ['Hormone regulation', 'Libido', 'Testosterone support', 'Fertility'],
    dosing: '50-100mcg daily',
    timing: 'Morning',
    research: 'moderate',
    synergies: ['pt-141', 'gonadorelin'],
    conflicts: [],
    researchNotes: 'Master regulator of reproductive hormones. Stimulates GnRH release. Being studied for fertility treatments.',
    helpsWithSymptoms: ['libido', 'hormones', 'fertility', 'low-testosterone'],
    sideEffects: ['Flushing', 'Headache'],
  },
]

const CATEGORIES = {
  healing: { label: 'Healing', color: 'bg-red-500', lightColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  weight: { label: 'Weight Loss', color: 'bg-green-500', lightColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  performance: { label: 'Performance', color: 'bg-orange-500', lightColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  cognitive: { label: 'Cognitive', color: 'bg-purple-500', lightColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  antiaging: { label: 'Anti-Aging', color: 'bg-pink-500', lightColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  immune: { label: 'Immune', color: 'bg-teal-500', lightColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  sexual: { label: 'Sexual Health', color: 'bg-rose-500', lightColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
}

interface StackBuilderProps {
  onAskAboutStack?: () => void
  onStartJourney?: () => void
}

// Utility to encode stack data for sharing
function encodeStackForSharing(peptides: string[], title?: string): string {
  const data = { p: peptides, t: title || 'My Stack' }
  return btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function StackBuilder({ onAskAboutStack, onStartJourney }: StackBuilderProps) {
  const [selectedPeptides, setSelectedPeptides] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [customPeptides, setCustomPeptides] = useState<CustomPeptide[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareTitle, setShareTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [stackLoaded, setStackLoaded] = useState(false)
  const [customForm, setCustomForm] = useState({
    name: '',
    category: 'performance',
    benefits: '',
    dosing: '',
    timing: '',
    researchNotes: '',
    tags: [] as Array<'fda-approved' | 'clinical-trials' | 'research-only' | 'user-added'>
  })

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load custom peptides
      const savedCustom = localStorage.getItem('peptide-ai-custom-peptides')
      if (savedCustom) {
        try {
          setCustomPeptides(JSON.parse(savedCustom))
        } catch (e) {
          console.error('Failed to load custom peptides:', e)
        }
      }

      // Load selected stack
      const savedStack = localStorage.getItem('peptide-ai-current-stack')
      if (savedStack) {
        try {
          setSelectedPeptides(JSON.parse(savedStack))
        } catch (e) {
          console.error('Failed to load saved stack:', e)
        }
      }

      // Load selected goals
      const savedGoals = localStorage.getItem('peptide-ai-selected-goals')
      if (savedGoals) {
        try {
          setSelectedGoals(JSON.parse(savedGoals))
        } catch (e) {
          console.error('Failed to load saved goals:', e)
        }
      }

      setStackLoaded(true)
    }
  }, [])

  // Save custom peptides to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && customPeptides.length > 0) {
      localStorage.setItem('peptide-ai-custom-peptides', JSON.stringify(customPeptides))
    }
  }, [customPeptides])

  // Save selected stack to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && stackLoaded) {
      localStorage.setItem('peptide-ai-current-stack', JSON.stringify(selectedPeptides))
    }
  }, [selectedPeptides, stackLoaded])

  // Save selected goals to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && stackLoaded) {
      localStorage.setItem('peptide-ai-selected-goals', JSON.stringify(selectedGoals))
    }
  }, [selectedGoals, stackLoaded])

  // Combine built-in and custom peptides
  const allPeptides = useMemo(() => [
    ...PEPTIDES,
    ...customPeptides.map(p => ({ ...p, helpsWithSymptoms: p.helpsWithSymptoms || [], sideEffects: p.sideEffects || [] }))
  ], [customPeptides])

  const addPeptide = (id: string, fromRecommendation = false) => {
    if (!selectedPeptides.includes(id) && selectedPeptides.length < 6) {
      const peptide = allPeptides.find(p => p.id === id)
      const newStackSize = selectedPeptides.length + 1
      setSelectedPeptides([...selectedPeptides, id])

      // Track the addition
      trackStackPeptideAdded({
        peptideId: id,
        peptideName: peptide?.name || id,
        stackSize: newStackSize,
        fromRecommendation,
      })
    }
  }

  const removePeptide = (id: string) => {
    const peptide = allPeptides.find(p => p.id === id)
    const newStackSize = selectedPeptides.length - 1
    setSelectedPeptides(selectedPeptides.filter(p => p !== id))

    // Track the removal
    trackStackPeptideRemoved({
      peptideId: id,
      peptideName: peptide?.name || id,
      stackSize: newStackSize,
    })
  }

  const toggleGoal = (goalId: string) => {
    const isSelecting = !selectedGoals.includes(goalId)
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    )

    // Only track when selecting a goal, not deselecting
    if (isSelecting) {
      const goal = SYMPTOM_CATEGORIES.find(g => g.id === goalId)
      trackStackGoalSelected({
        goalId,
        goalLabel: goal?.label || goalId,
        totalGoals: selectedGoals.length + 1,
      })
    }
  }

  const addCustomPeptide = () => {
    if (!customForm.name.trim()) return

    const newPeptide: CustomPeptide = {
      id: `custom-${Date.now()}`,
      name: customForm.name.trim(),
      category: customForm.category,
      benefits: customForm.benefits.split(',').map(b => b.trim()).filter(Boolean),
      dosing: customForm.dosing || 'Consult research',
      timing: customForm.timing || 'Varies',
      research: 'unknown',
      synergies: [],
      conflicts: [],
      researchNotes: customForm.researchNotes || 'User-added peptide. Research independently.',
      isCustom: true,
      tags: [...customForm.tags, 'user-added'],
      helpsWithSymptoms: [],
      sideEffects: [],
    }

    setCustomPeptides(prev => [...prev, newPeptide])
    setSelectedPeptides(prev => [...prev, newPeptide.id])
    setCustomForm({
      name: '',
      category: 'performance',
      benefits: '',
      dosing: '',
      timing: '',
      researchNotes: '',
      tags: []
    })
    setShowAddCustom(false)
  }

  const handleShare = () => {
    const code = encodeStackForSharing(selectedPeptides, shareTitle)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${baseUrl}/share/${code}`
    setShareLink(link)
    setShowShareModal(true)
    setCopied(false)

    // Track the share action
    trackStackShared({
      stackSize: selectedPeptides.length,
      peptides: selectedPeptideData.map(p => p.name),
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  const selectedPeptideData = selectedPeptides.map(id => allPeptides.find(p => p.id === id)!).filter(Boolean)

  // Goal to symptom keyword mapping for better matching
  const goalKeywords: Record<string, string[]> = {
    'fat-loss': ['fat', 'weight', 'metabolic', 'appetite', 'obesity'],
    'muscle': ['muscle', 'strength', 'recovery', 'anabolic', 'growth'],
    'healing': ['healing', 'repair', 'injury', 'tissue', 'wound', 'tendon', 'ligament'],
    'energy': ['energy', 'endurance', 'fatigue', 'stamina', 'mitochondria'],
    'cognitive': ['cognitive', 'focus', 'memory', 'brain', 'mental', 'neuro'],
    'sleep': ['sleep', 'insomnia', 'circadian', 'rest'],
    'longevity': ['longevity', 'aging', 'anti-aging', 'telomere', 'lifespan'],
    'immune': ['immune', 'inflammation', 'autoimmune', 'infection'],
  }

  // Get recommended peptides based on goals, sorted by relevance
  const recommendedPeptides = useMemo(() => {
    if (selectedGoals.length === 0) return []

    // Score each peptide by how many goals it matches
    const scored = allPeptides
      .filter(p => !selectedPeptides.includes(p.id))
      .map(p => {
        let score = 0
        selectedGoals.forEach(goal => {
          const keywords = goalKeywords[goal] || [goal]
          // Check if any symptom matches any keyword for this goal
          if (p.helpsWithSymptoms.some(s =>
            keywords.some(kw => s.toLowerCase().includes(kw))
          )) {
            score++
          }
          // Also check benefits
          if (p.benefits.some(b =>
            keywords.some(kw => b.toLowerCase().includes(kw))
          )) {
            score += 0.5
          }
        })
        return { peptide: p, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ peptide }) => peptide)

    return scored
  }, [selectedGoals, selectedPeptides, allPeptides])

  // Check for synergies and conflicts
  const synergies: Array<{ from: string; to: string }> = []
  const conflicts: Array<{ from: string; to: string; reason: string }> = []

  selectedPeptideData.forEach(peptide => {
    peptide.synergies.forEach(syn => {
      if (selectedPeptides.includes(syn) && !synergies.find(s =>
        (s.from === peptide.id && s.to === syn) || (s.from === syn && s.to === peptide.id)
      )) {
        synergies.push({ from: peptide.id, to: syn })
      }
    })
    peptide.conflicts.forEach(conf => {
      if (selectedPeptides.includes(conf) && !conflicts.find(c =>
        (c.from === peptide.id && c.to === conf) || (c.from === conf && c.to === peptide.id)
      )) {
        conflicts.push({
          from: peptide.id,
          to: conf,
          reason: `${peptide.name} and ${PEPTIDES.find(p => p.id === conf)?.name} shouldn't be combined`
        })
      }
    })
  })

  // Filter peptides by search
  const filteredPeptides = useMemo(() => {
    if (!searchQuery.trim()) return allPeptides
    const query = searchQuery.toLowerCase()
    return allPeptides.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.benefits.some(b => b.toLowerCase().includes(query)) ||
      p.category.toLowerCase().includes(query)
    )
  }, [allPeptides, searchQuery])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-blue-500" />
          Stack Builder
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select your goals, then build a research-backed stack
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Goals Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              What are you trying to achieve?
            </h3>
            {selectedGoals.length > 0 && (
              <button
                onClick={() => setSelectedGoals([])}
                className="text-xs text-slate-400 hover:text-blue-500"
              >
                Clear goals
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CATEGORIES.map((goal) => {
              const Icon = goal.icon
              const isSelected = selectedGoals.includes(goal.id)
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all",
                    isSelected
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isSelected ? "text-white" : goal.color)} />
                  {goal.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Recommended Peptides based on goals */}
        {recommendedPeptides.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Recommended for your goals ({recommendedPeptides.length})
              </h3>
              <button
                onClick={() => {
                  const toAdd = recommendedPeptides.slice(0, 6 - selectedPeptides.length)
                  toAdd.forEach(p => addPeptide(p.id, true))
                }}
                disabled={selectedPeptides.length >= 6}
                className="text-xs px-3 py-1 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium disabled:opacity-50 transition-colors"
              >
                + Add All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedPeptides.map((peptide) => {
                const category = CATEGORIES[peptide.category as keyof typeof CATEGORIES]
                return (
                  <button
                    key={peptide.id}
                    onClick={() => addPeptide(peptide.id, true)}
                    disabled={selectedPeptides.length >= 6}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-yellow-300 dark:border-yellow-700 hover:border-yellow-500 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 text-yellow-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-slate-900 dark:text-white">{peptide.name}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", category?.lightColor)}>
                      {category?.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Prompt to select goals if none selected and no stack */}
        {selectedGoals.length === 0 && selectedPeptides.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Start by selecting your goals above
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              We&apos;ll recommend peptides based on what you want to achieve
            </p>
          </div>
        )}

        {/* Quick Search & All Peptides */}
        <div className="mb-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search peptides..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Peptide Pills */}
          <div className="flex flex-wrap gap-1.5">
            {filteredPeptides.map((peptide) => {
              const isSelected = selectedPeptides.includes(peptide.id)
              const category = CATEGORIES[peptide.category as keyof typeof CATEGORIES]

              return (
                <button
                  key={peptide.id}
                  onClick={() => isSelected ? removePeptide(peptide.id) : addPeptide(peptide.id)}
                  disabled={!isSelected && selectedPeptides.length >= 6}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                  )}
                >
                  {peptide.name}
                  {isSelected && <X className="h-3 w-3 ml-1 inline" />}
                </button>
              )
            })}

            {/* Add Custom Button */}
            <button
              onClick={() => setShowAddCustom(true)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              <Plus className="h-3 w-3 inline mr-1" />
              Add custom
            </button>
          </div>
        </div>

        {/* Add Custom Peptide Form */}
        {showAddCustom && (
          <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900 dark:text-white">Add Custom Peptide</h4>
              <button onClick={() => setShowAddCustom(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={customForm.name}
                onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Peptide name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customForm.dosing}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, dosing: e.target.value }))}
                  placeholder="Dosing"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
                <input
                  type="text"
                  value={customForm.timing}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, timing: e.target.value }))}
                  placeholder="Timing"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Custom peptides should be verified independently.
                </p>
              </div>
              <button
                onClick={addCustomPeptide}
                disabled={!customForm.name.trim()}
                className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-medium transition-colors"
              >
                Add to Stack
              </button>
            </div>
          </div>
        )}

        {/* Selected Stack - Full Details */}
        {selectedPeptides.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Your Stack ({selectedPeptides.length}/6)
                <span className="text-xs font-normal text-slate-400 ml-1">• Auto-saved</span>
              </h3>
              <button
                onClick={() => setSelectedPeptides([])}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                Clear all
              </button>
            </div>

            {/* Synergies Alert */}
            {synergies.length > 0 && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">{synergies.length} synergistic combinations detected</span>
                </div>
              </div>
            )}

            {/* Conflicts Alert */}
            {conflicts.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning: {conflicts[0].reason}</span>
                </div>
              </div>
            )}

            {/* Detailed Peptide Cards */}
            <div className="space-y-3">
              {selectedPeptideData.map((peptide) => {
                const category = CATEGORIES[peptide.category as keyof typeof CATEGORIES]
                return (
                  <div
                    key={peptide.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">{peptide.name}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", category?.lightColor)}>
                            {category?.label}
                          </span>
                          {peptide.research === 'strong' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                              <BadgeCheck className="h-3 w-3" />
                              Well-researched
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {peptide.benefits.map(b => (
                            <span key={b} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removePeptide(peptide.id)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>

                    {/* Dosing & Timing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 block mb-1">Dosing</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{peptide.dosing}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 block mb-1">Timing</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{peptide.timing}</span>
                      </div>
                    </div>

                    {/* Side Effects */}
                    {peptide.sideEffects.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 block mb-1">
                          Potential Side Effects
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {peptide.sideEffects.map(se => (
                            <span key={se} className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                              {se}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Research Notes */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {peptide.researchNotes}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Protocol Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-blue-500" />
                Daily Protocol
              </h4>
              <div className="space-y-2 text-sm">
                {selectedPeptideData.some(p => p.timing.toLowerCase().includes('morning') || p.timing.toLowerCase().includes('fasted')) && (
                  <div className="flex items-start gap-2">
                    <span className="w-20 font-medium text-slate-500 shrink-0">Morning:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedPeptideData.filter(p => p.timing.toLowerCase().includes('morning') || p.timing.toLowerCase().includes('fasted')).map(p => p.name).join(', ')}
                    </span>
                  </div>
                )}
                {selectedPeptideData.some(p => p.timing.toLowerCase().includes('bed') || p.timing.toLowerCase().includes('evening')) && (
                  <div className="flex items-start gap-2">
                    <span className="w-20 font-medium text-slate-500 shrink-0">Evening:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedPeptideData.filter(p => p.timing.toLowerCase().includes('bed') || p.timing.toLowerCase().includes('evening')).map(p => p.name).join(', ')}
                    </span>
                  </div>
                )}
                {selectedPeptideData.some(p => p.timing.toLowerCase().includes('weekly')) && (
                  <div className="flex items-start gap-2">
                    <span className="w-20 font-medium text-slate-500 shrink-0">Weekly:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedPeptideData.filter(p => p.timing.toLowerCase().includes('weekly')).map(p => p.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    trackStackAskAI({
                      stackSize: selectedPeptides.length,
                      peptides: selectedPeptideData.map(p => p.name),
                      goals: selectedGoals,
                    })
                    onAskAboutStack?.()
                  }}
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask AI About This Stack
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  title="Share this stack"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  trackStackStartJourney({
                    stackSize: selectedPeptides.length,
                    peptides: selectedPeptideData.map(p => p.name),
                    goals: selectedGoals,
                  })
                  onStartJourney?.()
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Beaker className="h-4 w-4" />
                Start Journey with This Stack
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Vendor Recommendations */}
            <VendorRecommendations
              peptides={selectedPeptideData.map(p => p.name)}
              userGoals={selectedGoals}
              className="mt-4"
            />
          </div>
        )}

        {/* Empty State */}
        {selectedPeptides.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Pill className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Select goals above to get recommendations</p>
            <p className="text-sm mt-1">Or search and select peptides directly</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowShareModal(false)}>
          <div
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-purple-500" />
                Share Your Stack
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Share your stack with friends. They&apos;ll see a preview and can sign up to unlock full details!
            </p>

            <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-1.5">
                {selectedPeptideData.slice(0, 3).map(p => (
                  <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {p.name}
                  </span>
                ))}
                {selectedPeptideData.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600">
                    +{selectedPeptideData.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stack Name (optional)
              </label>
              <input
                type="text"
                value={shareTitle}
                onChange={(e) => {
                  setShareTitle(e.target.value)
                  const code = encodeStackForSharing(selectedPeptides, e.target.value)
                  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
                  setShareLink(`${baseUrl}/share/${code}`)
                }}
                placeholder="e.g., My Healing Stack"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-600 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors",
                  copied ? "bg-green-500 text-white" : "bg-purple-500 hover:bg-purple-600 text-white"
                )}
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Friends will see a teaser and can sign up to view full protocols!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
