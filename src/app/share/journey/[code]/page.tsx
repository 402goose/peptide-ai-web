'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Beaker, Lock, ArrowRight, Check, Calendar, Pill,
  TrendingUp, Heart, Syringe, Users, Play, Pause,
  CheckCircle, XCircle, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300', icon: Clock },
  active: { label: 'Active', color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', icon: Play },
  paused: { label: 'Paused', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', icon: Pause },
  completed: { label: 'Completed', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
  discontinued: { label: 'Discontinued', color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

interface SharedJourney {
  title: string
  primaryPeptide: string
  additionalPeptides: string[]
  status: keyof typeof STATUS_CONFIG
  startDate?: string
  goals?: string
  doseCount: number
  checkInCount: number
  avgRating?: number
  duration?: string
}

function decodeJourneyFromCode(code: string): SharedJourney | null {
  try {
    // Restore base64 padding and special chars
    let base64 = code.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) base64 += '='
    const decoded = JSON.parse(atob(base64))
    return {
      title: decoded.t || 'Shared Journey',
      primaryPeptide: decoded.p || '',
      additionalPeptides: decoded.a || [],
      status: decoded.s || 'active',
      startDate: decoded.d,
      goals: decoded.g,
      doseCount: decoded.dc || 0,
      checkInCount: decoded.cc || 0,
      avgRating: decoded.r,
      duration: decoded.du,
    }
  } catch (e) {
    console.error('Failed to decode journey:', e)
    return null
  }
}

export default function ShareJourneyPage() {
  const params = useParams()
  const router = useRouter()
  const [journey, setJourney] = useState<SharedJourney | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params?.code) {
      const decoded = decodeJourneyFromCode(params.code as string)
      setJourney(decoded)
    }
    setLoading(false)
  }, [params?.code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-pulse">
          <Beaker className="h-12 w-12 text-emerald-500" />
        </div>
      </div>
    )
  }

  if (!journey || !journey.primaryPeptide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8">
          <Beaker className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Journey Not Found
          </h1>
          <p className="text-slate-500 mb-4">
            This shared journey link may have expired or is invalid.
          </p>
          <Button onClick={() => router.push('/journey')}>
            Start Your Own Journey
          </Button>
        </div>
      </div>
    )
  }

  const config = STATUS_CONFIG[journey.status]
  const StatusIcon = config.icon
  const allPeptides = [journey.primaryPeptide, ...journey.additionalPeptides]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-lg px-4 dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <Beaker className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            Peptide AI
          </span>
        </div>
        <Button size="sm" onClick={() => router.push('/sign-up')}>
          Sign Up Free
        </Button>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            A friend shared their journey
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {journey.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            See how they&apos;re tracking their peptide research.
            <br />
            Sign up to track your own journey!
          </p>
        </div>

        {/* Journey Preview Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg mb-6">
          {/* Status Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium', config.color)}>
                  <StatusIcon className="h-4 w-4" />
                  {config.label}
                </div>
                {journey.duration && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {journey.duration}
                  </span>
                )}
              </div>
              {journey.avgRating && (
                <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  {journey.avgRating}/10 avg
                </div>
              )}
            </div>
          </div>

          {/* Peptide Stack */}
          <div className="p-4">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
              <Pill className="h-3.5 w-3.5" />
              PEPTIDE STACK
            </h3>
            <div className="flex flex-wrap gap-2">
              {allPeptides.map((peptide, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium",
                    index === 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  )}
                >
                  {peptide}
                  {index === 0 && <span className="text-xs ml-1 opacity-60">(Primary)</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-700">
            <div className="p-4 text-center border-r border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <Syringe className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{journey.doseCount}</div>
              <div className="text-xs text-slate-500">Doses Logged</div>
            </div>
            <div className="p-4 text-center border-r border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <Heart className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{journey.checkInCount}</div>
              <div className="text-xs text-slate-500">Check-ins</div>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {journey.startDate ? new Date(journey.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
              </div>
              <div className="text-xs text-slate-500">Started</div>
            </div>
          </div>

          {/* Blurred Goals/Notes */}
          {journey.goals && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">GOALS & NOTES</h3>
              <div className="relative">
                <p className="text-sm text-transparent select-none blur-[4px]">
                  {journey.goals}
                </p>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                    <Lock className="h-3 w-3" />
                    Sign up to see goals
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locked section */}
          <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Lock className="h-4 w-4" />
              <span className="text-sm">
                Full dose logs, check-in details, and progress charts hidden
              </span>
            </div>
          </div>
        </div>

        {/* What you get when you sign up */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
            Start your own journey:
          </h2>
          <div className="grid gap-3">
            {[
              { icon: Syringe, text: 'Log doses with timing, sites, and notes' },
              { icon: Heart, text: 'Daily check-ins to track how you feel' },
              { icon: TrendingUp, text: 'See progress trends over time' },
              { icon: Beaker, text: 'Build your own peptide stack' },
              { icon: Users, text: 'Share your journey with friends' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
                <Check className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full py-6 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            onClick={() => router.push('/sign-up')}
          >
            Sign Up Free - Start Your Journey
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-xs text-center text-slate-400">
            Free forever. No credit card required.
          </p>
        </div>

        {/* Already have account */}
        <div className="mt-6 text-center">
          <span className="text-sm text-slate-500">Already have an account?</span>
          <Button variant="link" onClick={() => router.push('/sign-in')} className="text-sm">
            Sign in
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>For research purposes only. Not medical advice.</p>
        <p className="mt-1">Peptide AI - Track smarter, not harder.</p>
      </footer>
    </div>
  )
}
