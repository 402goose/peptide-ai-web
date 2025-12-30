'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DoseLogForm } from '@/components/journey/DoseLogForm'
import { CheckInForm } from '@/components/journey/CheckInForm'
import { Feedbackable } from '@/components/feedback'
import {
  Plus, ArrowLeft, Syringe, Heart, Beaker, Play, Pause,
  CheckCircle, XCircle, Clock, Pill, Calendar, Trash2,
  ChevronDown, ChevronUp, TrendingUp, Search, Mail, X, Loader2,
  Share2, Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackJourneyCreated, trackJourneyShared } from '@/lib/analytics'

// Local journey types for localStorage
interface LocalJourney {
  id: string
  title: string
  primaryPeptide: string
  additionalPeptides: string[]
  status: 'planning' | 'active' | 'paused' | 'completed' | 'discontinued'
  startDate?: string
  endDate?: string
  goals: string
  doseLogs: LocalDoseLog[]
  checkIns: LocalCheckIn[]
  createdAt: string
  updatedAt: string
}

interface LocalDoseLog {
  id: string
  peptide: string
  doseAmount: number
  doseUnit: string
  route?: string
  injectionSite?: string
  timeOfDay?: string
  fasted?: boolean
  notes?: string
  loggedAt: string
}

interface LocalCheckIn {
  id: string
  date: string
  energyLevel?: number
  sleepQuality?: number
  mood?: number
  recoveryFeeling?: number
  sideEffects: string[]
  sideEffectSeverity: 'none' | 'mild' | 'moderate' | 'severe'
  notes?: string
  loggedAt: string
}

// Peptide database (matching StackBuilder)
const PEPTIDES = [
  // Healing
  { id: 'bpc-157', name: 'BPC-157', category: 'Healing' },
  { id: 'tb-500', name: 'TB-500', category: 'Healing' },
  { id: 'ghk-cu', name: 'GHK-Cu', category: 'Healing' },
  { id: 'pentadecarginine', name: 'Pentadecarginine', category: 'Healing' },
  // Weight Management
  { id: 'semaglutide', name: 'Semaglutide', category: 'Weight Management' },
  { id: 'tirzepatide', name: 'Tirzepatide', category: 'Weight Management' },
  { id: 'aod-9604', name: 'AOD-9604', category: 'Weight Management' },
  { id: 'tesamorelin', name: 'Tesamorelin', category: 'Weight Management' },
  { id: 'sr9009', name: 'SR9009', category: 'Weight Management' },
  { id: '5-amino-1mq', name: '5-Amino 1MQ', category: 'Weight Management' },
  // Performance
  { id: 'ipamorelin', name: 'Ipamorelin', category: 'Performance' },
  { id: 'cjc-1295', name: 'CJC-1295', category: 'Performance' },
  { id: 'mk-677', name: 'MK-677', category: 'Performance' },
  { id: 'ghrp-6', name: 'GHRP-6', category: 'Performance' },
  { id: 'ghrp-2', name: 'GHRP-2', category: 'Performance' },
  { id: 'sermorelin', name: 'Sermorelin', category: 'Performance' },
  // Cognitive
  { id: 'semax', name: 'Semax', category: 'Cognitive' },
  { id: 'selank', name: 'Selank', category: 'Cognitive' },
  { id: 'dihexa', name: 'Dihexa', category: 'Cognitive' },
  { id: 'na-selank', name: 'NA-Selank', category: 'Cognitive' },
  { id: 'p21', name: 'P21', category: 'Cognitive' },
  // Mitochondrial
  { id: 'ss-31', name: 'SS-31', category: 'Mitochondrial' },
  { id: 'mots-c', name: 'MOTS-c', category: 'Mitochondrial' },
  { id: 'humanin', name: 'Humanin', category: 'Mitochondrial' },
  { id: 'nad-im', name: 'NAD+ IM', category: 'Mitochondrial' },
  // Sleep
  { id: 'dsip', name: 'DSIP', category: 'Sleep' },
  // Anti-Aging
  { id: 'epithalon', name: 'Epithalon', category: 'Anti-Aging' },
  // Immune
  { id: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', category: 'Immune' },
  { id: 'll-37', name: 'LL-37', category: 'Immune' },
  { id: 'kpv', name: 'KPV', category: 'Immune' },
  // Gut
  { id: 'larazotide', name: 'Larazotide', category: 'Gut Health' },
  // Sexual Health
  { id: 'pt-141', name: 'PT-141', category: 'Sexual Health' },
  { id: 'kisspeptin', name: 'Kisspeptin', category: 'Sexual Health' },
  // Other
  { id: 'melanotan-ii', name: 'Melanotan II', category: 'Tanning' },
]

type View = 'list' | 'create' | 'dose' | 'checkin' | 'detail' | 'viewDoses'

const STORAGE_KEY = 'peptide-ai-journeys'

// Load journeys from localStorage
function loadJourneys(): LocalJourney[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    console.error('Failed to load journeys:', e)
    return []
  }
}

// Save journeys to localStorage
function saveJourneys(journeys: LocalJourney[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys))
  } catch (e) {
    console.error('Failed to save journeys:', e)
  }
}

const STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300', icon: Clock },
  active: { label: 'Active', color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', icon: Play },
  paused: { label: 'Paused', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', icon: Pause },
  completed: { label: 'Completed', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
  discontinued: { label: 'Discontinued', color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

function JourneyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [journeys, setJourneys] = useState<LocalJourney[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')
  const [selectedJourney, setSelectedJourney] = useState<LocalJourney | null>(null)
  const [expandedJourney, setExpandedJourney] = useState<string | null>(null)

  // Form state for creating journey
  const [newJourney, setNewJourney] = useState({
    title: '',
    primaryPeptide: '',
    additionalPeptides: [] as string[],
    goals: '',
  })
  const [peptideSearch, setPeptideSearch] = useState('')

  // Email modal state
  const [emailModalJourney, setEmailModalJourney] = useState<LocalJourney | null>(null)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Share modal state
  const [shareModalJourney, setShareModalJourney] = useState<LocalJourney | null>(null)
  const [shareLink, setShareLink] = useState('')

  // Editing dose state
  const [editingDose, setEditingDose] = useState<LocalDoseLog | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    const loaded = loadJourneys()
    setJourneys(loaded)
    setLoading(false)
  }, [])

  // Handle coming from Stack Builder with a pre-built stack
  useEffect(() => {
    const fromStack = searchParams?.get('fromStack')
    if (fromStack === 'true' && typeof window !== 'undefined') {
      // Load stack from localStorage (saved by Stack Builder)
      const savedStack = localStorage.getItem('peptide-ai-current-stack')
      const savedGoals = localStorage.getItem('peptide-ai-selected-goals')

      if (savedStack) {
        try {
          const peptideIds: string[] = JSON.parse(savedStack)
          const goalIds: string[] = savedGoals ? JSON.parse(savedGoals) : []

          if (peptideIds.length > 0) {
            // Convert peptide IDs to names (matching PEPTIDES list or using formatted ID)
            const peptideNames = peptideIds.map(id => {
              const found = PEPTIDES.find(p => p.id === id)
              return found ? found.name : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            })

            // First peptide is primary, rest are additional
            const primaryPeptide = peptideNames[0]
            const additionalPeptides = peptideNames.slice(1)

            // Create a default title based on the stack
            const title = primaryPeptide + (additionalPeptides.length > 0 ? ` + ${additionalPeptides.length} more` : '') + ' Journey'

            // Format goals text
            const goalsText = goalIds.length > 0
              ? `Goals: ${goalIds.map(g => g.replace(/-/g, ' ')).join(', ')}`
              : ''

            // Pre-fill the form
            setNewJourney({
              title,
              primaryPeptide,
              additionalPeptides,
              goals: goalsText,
            })

            // Switch to create view
            setView('create')

            // Clear the URL param
            window.history.replaceState(null, '', '/journey')
          }
        } catch (e) {
          console.error('Failed to load stack:', e)
        }
      }
    }
  }, [searchParams])

  const updateJourneys = useCallback((updater: (journeys: LocalJourney[]) => LocalJourney[]) => {
    setJourneys(prev => {
      const updated = updater(prev)
      saveJourneys(updated)
      return updated
    })
  }, [])

  function handleCreateJourney() {
    if (!newJourney.title || !newJourney.primaryPeptide) return

    const journey: LocalJourney = {
      id: `journey-${Date.now()}`,
      title: newJourney.title,
      primaryPeptide: newJourney.primaryPeptide,
      additionalPeptides: newJourney.additionalPeptides,
      status: 'planning',
      goals: newJourney.goals,
      doseLogs: [],
      checkIns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    updateJourneys(prev => [...prev, journey])
    setNewJourney({ title: '', primaryPeptide: '', additionalPeptides: [], goals: '' })
    setView('list')

    // Track the journey creation
    trackJourneyCreated({
      primaryPeptide: newJourney.primaryPeptide,
      additionalPeptides: newJourney.additionalPeptides,
      hasGoals: Boolean(newJourney.goals),
    })
  }

  function handleStartJourney(journeyId: string) {
    updateJourneys(prev => prev.map(j =>
      j.id === journeyId
        ? { ...j, status: 'active' as const, startDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : j
    ))
  }

  function handlePauseJourney(journeyId: string) {
    updateJourneys(prev => prev.map(j =>
      j.id === journeyId
        ? { ...j, status: 'paused' as const, updatedAt: new Date().toISOString() }
        : j
    ))
  }

  function handleResumeJourney(journeyId: string) {
    updateJourneys(prev => prev.map(j =>
      j.id === journeyId
        ? { ...j, status: 'active' as const, updatedAt: new Date().toISOString() }
        : j
    ))
  }

  function handleCompleteJourney(journeyId: string) {
    updateJourneys(prev => prev.map(j =>
      j.id === journeyId
        ? { ...j, status: 'completed' as const, endDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : j
    ))
  }

  function handleDeleteJourney(journeyId: string) {
    if (!confirm('Are you sure you want to delete this journey?')) return
    updateJourneys(prev => prev.filter(j => j.id !== journeyId))
  }

  async function handleLogDose(data: any) {
    if (!selectedJourney) return

    const doseLog: LocalDoseLog = {
      id: `dose-${Date.now()}`,
      peptide: data.peptide,
      doseAmount: data.dose_amount,
      doseUnit: data.dose_unit,
      route: data.route,
      injectionSite: data.injection_site,
      timeOfDay: data.time_of_day,
      fasted: data.fasted,
      notes: data.notes,
      loggedAt: new Date().toISOString(),
    }

    updateJourneys(prev => prev.map(j =>
      j.id === selectedJourney.id
        ? { ...j, doseLogs: [...j.doseLogs, doseLog], updatedAt: new Date().toISOString() }
        : j
    ))

    setView('list')
    setSelectedJourney(null)
  }

  async function handleCheckIn(data: any) {
    if (!selectedJourney) return

    const checkIn: LocalCheckIn = {
      id: `checkin-${Date.now()}`,
      date: data.log_date,
      energyLevel: data.energy_level,
      sleepQuality: data.sleep_quality,
      mood: data.mood,
      recoveryFeeling: data.recovery_feeling,
      sideEffects: data.side_effects || [],
      sideEffectSeverity: data.side_effect_severity || 'none',
      notes: data.notes,
      loggedAt: new Date().toISOString(),
    }

    updateJourneys(prev => prev.map(j =>
      j.id === selectedJourney.id
        ? { ...j, checkIns: [...j.checkIns, checkIn], updatedAt: new Date().toISOString() }
        : j
    ))

    setView('list')
    setSelectedJourney(null)
  }

  const activeJourneys = journeys.filter(j => j.status === 'active')
  const filteredPeptides = PEPTIDES.filter(p =>
    p.name.toLowerCase().includes(peptideSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(peptideSearch.toLowerCase())
  )

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not started'
    return new Date(dateStr).toLocaleDateString()
  }

  const getAverageRating = (journey: LocalJourney) => {
    if (journey.checkIns.length === 0) return null
    const recent = journey.checkIns.slice(-7) // Last 7 check-ins
    const sum = recent.reduce((acc, c) => {
      let count = 0
      let total = 0
      if (c.energyLevel) { total += c.energyLevel; count++ }
      if (c.sleepQuality) { total += c.sleepQuality; count++ }
      if (c.mood) { total += c.mood; count++ }
      if (c.recoveryFeeling) { total += c.recoveryFeeling; count++ }
      return acc + (count > 0 ? total / count : 0)
    }, 0)
    return (sum / recent.length).toFixed(1)
  }

  const formatJourneyForEmail = (journey: LocalJourney) => {
    const lines: string[] = []

    lines.push(`MY PEPTIDE JOURNEY: ${journey.title}`)
    lines.push('='.repeat(50))
    lines.push('')

    // Status and dates
    lines.push(`Status: ${STATUS_CONFIG[journey.status].label}`)
    if (journey.startDate) {
      lines.push(`Started: ${formatDate(journey.startDate)}`)
    }
    if (journey.endDate) {
      lines.push(`Ended: ${formatDate(journey.endDate)}`)
    }
    lines.push('')

    // Peptides
    lines.push('PEPTIDES')
    lines.push('-'.repeat(30))
    lines.push(`Primary: ${journey.primaryPeptide}`)
    if (journey.additionalPeptides.length > 0) {
      lines.push(`Stack: ${journey.additionalPeptides.join(', ')}`)
    }
    lines.push('')

    // Goals
    if (journey.goals) {
      lines.push('GOALS & NOTES')
      lines.push('-'.repeat(30))
      lines.push(journey.goals)
      lines.push('')
    }

    // Recent doses
    if (journey.doseLogs.length > 0) {
      lines.push('RECENT DOSE LOG')
      lines.push('-'.repeat(30))
      journey.doseLogs.slice(-10).reverse().forEach(dose => {
        const date = new Date(dose.loggedAt).toLocaleDateString()
        lines.push(`${date} - ${dose.peptide}: ${dose.doseAmount}${dose.doseUnit}${dose.route ? ` (${dose.route})` : ''}`)
        if (dose.notes) lines.push(`  Note: ${dose.notes}`)
      })
      lines.push('')
    }

    // Recent check-ins
    if (journey.checkIns.length > 0) {
      lines.push('RECENT CHECK-INS')
      lines.push('-'.repeat(30))
      journey.checkIns.slice(-7).reverse().forEach(checkin => {
        const date = new Date(checkin.date).toLocaleDateString()
        const ratings: string[] = []
        if (checkin.energyLevel) ratings.push(`Energy: ${checkin.energyLevel}/10`)
        if (checkin.mood) ratings.push(`Mood: ${checkin.mood}/10`)
        if (checkin.sleepQuality) ratings.push(`Sleep: ${checkin.sleepQuality}/10`)
        if (checkin.recoveryFeeling) ratings.push(`Recovery: ${checkin.recoveryFeeling}/10`)
        lines.push(`${date} - ${ratings.join(', ')}`)
        if (checkin.sideEffects.length > 0) {
          lines.push(`  Side effects (${checkin.sideEffectSeverity}): ${checkin.sideEffects.join(', ')}`)
        }
        if (checkin.notes) lines.push(`  Note: ${checkin.notes}`)
      })
      lines.push('')
    }

    // Average rating
    const avgRating = getAverageRating(journey)
    if (avgRating) {
      lines.push(`Average Rating (last 7 check-ins): ${avgRating}/10`)
      lines.push('')
    }

    lines.push('-'.repeat(50))
    lines.push('Generated by Peptide AI - https://peptide.ai')

    return lines.join('\n')
  }

  const handleEmailPlan = (journey: LocalJourney) => {
    // Pre-fill with user's email if available
    const userEmail = user?.primaryEmailAddress?.emailAddress || ''
    setEmailAddress(userEmail)
    setEmailModalJourney(journey)
    setEmailSent(false)
    setEmailError(null)
  }

  const handleSendEmail = async () => {
    if (!emailModalJourney || !emailAddress) return

    setEmailSending(true)
    setEmailError(null)

    try {
      const response = await fetch('/api/email/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: emailAddress,
          journey_title: emailModalJourney.title,
          journey_content: formatJourneyForEmail(emailModalJourney),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to send email')
      }

      setEmailSent(true)
      // Auto-close after success
      setTimeout(() => {
        setEmailModalJourney(null)
        setEmailSent(false)
      }, 2000)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setEmailSending(false)
    }
  }

  const closeEmailModal = () => {
    setEmailModalJourney(null)
    setEmailAddress('')
    setEmailSent(false)
    setEmailError(null)
  }

  // Calculate journey duration
  const getJourneyDuration = (journey: LocalJourney) => {
    if (!journey.startDate) return undefined
    const start = new Date(journey.startDate)
    const end = journey.endDate ? new Date(journey.endDate) : new Date()
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    if (days < 7) return `${days} days`
    if (days < 30) return `${Math.floor(days / 7)} weeks`
    return `${Math.floor(days / 30)} months`
  }

  // Encode journey for sharing
  const encodeJourneyForSharing = (journey: LocalJourney): string => {
    const avgRating = getAverageRating(journey)
    const data = {
      t: journey.title,
      p: journey.primaryPeptide,
      a: journey.additionalPeptides,
      s: journey.status,
      d: journey.startDate,
      g: journey.goals?.slice(0, 100), // Truncate goals
      dc: journey.doseLogs.length,
      cc: journey.checkIns.length,
      r: avgRating ? parseFloat(avgRating) : undefined,
      du: getJourneyDuration(journey),
    }
    return btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  const handleShareJourney = (journey: LocalJourney) => {
    const code = encodeJourneyForSharing(journey)
    const link = `${window.location.origin}/share/journey/${code}`
    setShareLink(link)
    setShareModalJourney(journey)
    setShareCopied(false)

    // Track the journey share
    trackJourneyShared({
      journeyStatus: journey.status,
      doseCount: journey.doseLogs.length,
      checkInCount: journey.checkIns.length,
    })
  }

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const closeShareModal = () => {
    setShareModalJourney(null)
    setShareLink('')
    setShareCopied(false)
  }

  return (
    <Feedbackable name="Journey Tracker" path="app/journey/page.tsx" className="min-h-screen">
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 0.5rem)',
          minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
              <Beaker className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Journey Tracker
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {view === 'list' && (
          <>
            {/* Quick Actions for Active Journeys */}
            {activeJourneys.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 py-4"
                    onClick={() => {
                      setSelectedJourney(activeJourneys[0])
                      setView('dose')
                    }}
                  >
                    <Syringe className="h-5 w-5 text-blue-500" />
                    <span>Log Dose</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 py-4"
                    onClick={() => {
                      setSelectedJourney(activeJourneys[0])
                      setView('checkin')
                    }}
                  >
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Daily Check-In</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Journey List */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Your Journeys
              </h2>
              <Button size="sm" onClick={() => setView('create')}>
                <Plus className="h-4 w-4 mr-1" />
                New Journey
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : journeys.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No journeys yet</p>
                <p className="text-sm mt-1">Start tracking your peptide research!</p>
                <Button className="mt-4" onClick={() => setView('create')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Your First Journey
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {journeys.map((journey) => {
                  const config = STATUS_CONFIG[journey.status]
                  const StatusIcon = config.icon
                  const isExpanded = expandedJourney === journey.id
                  const avgRating = getAverageRating(journey)

                  return (
                    <div
                      key={journey.id}
                      className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden"
                    >
                      {/* Journey Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750"
                        onClick={() => setExpandedJourney(isExpanded ? null : journey.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {journey.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Pill className="h-3.5 w-3.5 text-blue-500" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {journey.primaryPeptide}
                                {journey.additionalPeptides.length > 0 && (
                                  <span className="text-slate-400"> +{journey.additionalPeptides.length}</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', config.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(journey.startDate)}
                          </div>
                          <div>
                            {journey.doseLogs.length} doses
                          </div>
                          <div>
                            {journey.checkIns.length} check-ins
                          </div>
                          {avgRating && (
                            <div className="flex items-center gap-1 font-medium text-blue-600">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {avgRating}/10 avg
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-850">
                          {journey.goals && (
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Goals</h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{journey.goals}</p>
                            </div>
                          )}

                          {journey.additionalPeptides.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Stack</h4>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                  {journey.primaryPeptide}
                                </span>
                                {journey.additionalPeptides.map(p => (
                                  <span key={p} className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recent Dose Logs */}
                          {journey.doseLogs.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Recent Doses</h4>
                              <div className="space-y-2">
                                {journey.doseLogs.slice(-3).reverse().map(dose => (
                                  <div key={dose.id} className="flex items-center justify-between text-sm p-2 rounded bg-white dark:bg-slate-800">
                                    <div className="flex items-center gap-2">
                                      <Syringe className="h-3.5 w-3.5 text-blue-500" />
                                      <span className="font-medium">{dose.peptide}</span>
                                      <span className="text-slate-500">{dose.doseAmount}{dose.doseUnit}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                      {new Date(dose.loggedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recent Check-ins */}
                          {journey.checkIns.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Recent Check-ins</h4>
                              <div className="space-y-2">
                                {journey.checkIns.slice(-3).reverse().map(checkin => (
                                  <div key={checkin.id} className="text-sm p-2 rounded bg-white dark:bg-slate-800">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-slate-400">{new Date(checkin.date).toLocaleDateString()}</span>
                                      {checkin.sideEffects.length > 0 && (
                                        <span className="text-xs text-amber-600">{checkin.sideEffects.length} side effects</span>
                                      )}
                                    </div>
                                    <div className="flex gap-3 text-xs">
                                      {checkin.energyLevel && <span>Energy: {checkin.energyLevel}/10</span>}
                                      {checkin.mood && <span>Mood: {checkin.mood}/10</span>}
                                      {checkin.sleepQuality && <span>Sleep: {checkin.sleepQuality}/10</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                            {journey.status === 'planning' && (
                              <Button size="sm" onClick={() => handleStartJourney(journey.id)}>
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Start Journey
                              </Button>
                            )}
                            {journey.status === 'active' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => {
                                  setSelectedJourney(journey)
                                  setView('dose')
                                }}>
                                  <Syringe className="h-3.5 w-3.5 mr-1" />
                                  Log Dose
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                  setSelectedJourney(journey)
                                  setView('checkin')
                                }}>
                                  <Heart className="h-3.5 w-3.5 mr-1" />
                                  Check-In
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handlePauseJourney(journey.id)}>
                                  <Pause className="h-3.5 w-3.5 mr-1" />
                                  Pause
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleCompleteJourney(journey.id)}>
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Complete
                                </Button>
                              </>
                            )}
                            {journey.status === 'paused' && (
                              <Button size="sm" onClick={() => handleResumeJourney(journey.id)}>
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Resume
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEmailPlan(journey)}
                            >
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              Email My Plan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShareJourney(journey)}
                            >
                              <Share2 className="h-3.5 w-3.5 mr-1" />
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                              onClick={() => handleDeleteJourney(journey.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {view === 'create' && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Start New Journey
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Journey Name
                </label>
                <Input
                  placeholder="e.g., BPC-157 Healing Protocol"
                  value={newJourney.title}
                  onChange={(e) => setNewJourney({ ...newJourney, title: e.target.value })}
                />
              </div>

              {/* Primary Peptide */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Peptide
                </label>

                {/* Show selected peptide */}
                {newJourney.primaryPeptide && (
                  <div className="mb-2 p-2 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">{newJourney.primaryPeptide}</div>
                      <div className="text-xs text-blue-500">Selected</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewJourney({ ...newJourney, primaryPeptide: '' })}
                      className="text-blue-400 hover:text-blue-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search peptides..."
                    className="pl-9"
                    value={peptideSearch}
                    onChange={(e) => setPeptideSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {filteredPeptides.map((peptide) => (
                    <button
                      key={peptide.id}
                      type="button"
                      className={cn(
                        'p-2 text-left text-sm rounded-lg border transition-colors',
                        newJourney.primaryPeptide === peptide.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
                      )}
                      onClick={() => {
                        setNewJourney({ ...newJourney, primaryPeptide: peptide.name })
                        setPeptideSearch('') // Clear search after selection
                      }}
                    >
                      <div className="font-medium text-slate-900 dark:text-white">{peptide.name}</div>
                      <div className="text-xs text-slate-500">{peptide.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Peptides */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Additional Peptides (optional)
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {PEPTIDES.filter(p => p.name !== newJourney.primaryPeptide).map((peptide) => (
                    <button
                      key={peptide.id}
                      type="button"
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full border transition-colors',
                        newJourney.additionalPeptides.includes(peptide.name)
                          ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
                      )}
                      onClick={() => {
                        const current = newJourney.additionalPeptides
                        if (current.includes(peptide.name)) {
                          setNewJourney({ ...newJourney, additionalPeptides: current.filter(p => p !== peptide.name) })
                        } else {
                          setNewJourney({ ...newJourney, additionalPeptides: [...current, peptide.name] })
                        }
                      }}
                    >
                      {peptide.name}
                    </button>
                  ))}
                </div>
                {newJourney.additionalPeptides.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Selected: {newJourney.additionalPeptides.join(', ')}
                  </div>
                )}
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Goals & Notes
                </label>
                <Textarea
                  placeholder="What are you hoping to achieve? Any specific protocols you're following?"
                  value={newJourney.goals}
                  onChange={(e) => setNewJourney({ ...newJourney, goals: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreateJourney}
                  disabled={!newJourney.title || !newJourney.primaryPeptide}
                >
                  Create Journey
                </Button>
                <Button variant="outline" onClick={() => {
                  setView('list')
                  setNewJourney({ title: '', primaryPeptide: '', additionalPeptides: [], goals: '' })
                  setPeptideSearch('')
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {view === 'dose' && selectedJourney && (
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4 text-sm text-slate-500">
                Logging for: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedJourney.title}</span>
              </div>
              <DoseLogForm
                peptide={selectedJourney.primaryPeptide}
                onSubmit={handleLogDose}
                onCancel={() => {
                  setView('list')
                  setSelectedJourney(null)
                }}
                loading={false}
              />
            </div>
          </div>
        )}

        {view === 'checkin' && selectedJourney && (
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4 text-sm text-slate-500">
                Check-in for: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedJourney.title}</span>
              </div>
              <CheckInForm
                onSubmit={handleCheckIn}
                onCancel={() => {
                  setView('list')
                  setSelectedJourney(null)
                }}
                loading={false}
              />
            </div>
          </div>
        )}
      </main>

      {/* Email Modal */}
      {emailModalJourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50">
          <div className="relative w-full max-w-sm sm:max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            {/* Close button */}
            <button
              onClick={closeEmailModal}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {emailSent ? (
                // Success state
                <div className="text-center py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Email Sent!
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Check your inbox for your journey plan.
                  </p>
                </div>
              ) : (
                // Email form
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Email Your Plan
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {emailModalJourney.title}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {emailError && (
                      <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        {emailError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSendEmail}
                        disabled={!emailAddress || emailSending}
                        className="flex-1 gap-2"
                      >
                        {emailSending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            Send Email
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={closeEmailModal}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalJourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50">
          <div className="relative w-full max-w-sm sm:max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            {/* Close button */}
            <button
              onClick={closeShareModal}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Share2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Share Your Journey
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {shareModalJourney.title}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Share your journey with friends. They&apos;ll see a preview of your progress and can start their own journey!
              </p>

              {/* Link preview */}
              <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {shareModalJourney.primaryPeptide}
                    {shareModalJourney.additionalPeptides.length > 0 && (
                      <span className="text-slate-400"> +{shareModalJourney.additionalPeptides.length}</span>
                    )}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{shareModalJourney.doseLogs.length} doses</span>
                  <span>{shareModalJourney.checkIns.length} check-ins</span>
                </div>
              </div>

              {/* Share link */}
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="text-sm bg-slate-50 dark:bg-slate-900"
                />
                <Button
                  onClick={handleCopyShareLink}
                  variant={shareCopied ? "default" : "outline"}
                  className={shareCopied ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {shareCopied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {shareCopied && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                  Link copied to clipboard!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </Feedbackable>
  )
}

// Wrap in Suspense for useSearchParams
export default function JourneyPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <JourneyPageContent />
    </Suspense>
  )
}
