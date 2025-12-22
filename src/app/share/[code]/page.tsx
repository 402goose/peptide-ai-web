'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  FlaskConical, Lock, Sparkles, ArrowRight, Check,
  Shield, Zap, Eye, Users, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Peptide database (simplified version for the share page)
const PEPTIDES: Record<string, { name: string; category: string; benefits: string[] }> = {
  'bpc-157': { name: 'BPC-157', category: 'Healing', benefits: ['Gut healing', 'Tissue repair', 'Anti-inflammatory'] },
  'tb-500': { name: 'TB-500', category: 'Healing', benefits: ['Wound healing', 'Flexibility', 'Muscle repair'] },
  'ghk-cu': { name: 'GHK-Cu', category: 'Healing', benefits: ['Skin health', 'Collagen synthesis', 'Anti-aging'] },
  'semaglutide': { name: 'Semaglutide', category: 'Weight', benefits: ['Weight loss', 'Appetite control', 'Blood sugar'] },
  'tirzepatide': { name: 'Tirzepatide', category: 'Weight', benefits: ['Superior weight loss', 'Dual action', 'Blood sugar'] },
  'aod-9604': { name: 'AOD-9604', category: 'Weight', benefits: ['Fat burning', 'Lipolysis', 'Cartilage repair'] },
  '5-amino-1mq': { name: '5-Amino-1MQ', category: 'Weight', benefits: ['Metabolic boost', 'Fat reduction', 'Energy'] },
  'tesofensine': { name: 'Tesofensine', category: 'Weight', benefits: ['Appetite suppression', 'Energy', 'Mood'] },
  'sr9009': { name: 'SR9009', category: 'Performance', benefits: ['Endurance', 'Fat oxidation', 'Mitochondria'] },
  'cardarine': { name: 'GW501516', category: 'Performance', benefits: ['Endurance', 'Fat burning', 'Recovery'] },
  'mk-677': { name: 'MK-677', category: 'Performance', benefits: ['GH release', 'Sleep', 'Muscle growth'] },
  'cjc-1295': { name: 'CJC-1295', category: 'Performance', benefits: ['GH release', 'Recovery', 'Fat loss'] },
  'ipamorelin': { name: 'Ipamorelin', category: 'Performance', benefits: ['Clean GH', 'Recovery', 'Anti-aging'] },
  'tesamorelin': { name: 'Tesamorelin', category: 'Performance', benefits: ['Visceral fat', 'Cognition', 'GH'] },
  'selank': { name: 'Selank', category: 'Cognitive', benefits: ['Anxiety relief', 'Focus', 'Memory'] },
  'semax': { name: 'Semax', category: 'Cognitive', benefits: ['Focus', 'BDNF', 'Neuroprotection'] },
  'dihexa': { name: 'Dihexa', category: 'Cognitive', benefits: ['Memory', 'Synaptogenesis', 'Cognition'] },
  'p21': { name: 'P21', category: 'Cognitive', benefits: ['Neurogenesis', 'Memory', 'Learning'] },
  'epithalon': { name: 'Epithalon', category: 'Anti-Aging', benefits: ['Telomeres', 'Sleep', 'Longevity'] },
  'thymalin': { name: 'Thymalin', category: 'Anti-Aging', benefits: ['Immune', 'Thymus', 'Anti-aging'] },
  'ss-31': { name: 'SS-31', category: 'Anti-Aging', benefits: ['Mitochondria', 'Energy', 'Cardio'] },
  'thymosin-alpha-1': { name: 'Thymosin Alpha-1', category: 'Immune', benefits: ['Immune boost', 'Infections', 'Recovery'] },
  'll-37': { name: 'LL-37', category: 'Immune', benefits: ['Antimicrobial', 'Wound healing', 'Biofilm'] },
  'pt-141': { name: 'PT-141', category: 'Sexual Health', benefits: ['Libido', 'Sexual function', 'Both sexes'] },
  'kisspeptin': { name: 'Kisspeptin-10', category: 'Sexual Health', benefits: ['Hormones', 'Libido', 'Fertility'] },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Healing': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Weight': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Performance': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Cognitive': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Anti-Aging': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Immune': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Sexual Health': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

interface SharedStack {
  peptides: string[]
  title: string
}

function decodeStackFromCode(code: string): SharedStack | null {
  try {
    // Restore base64 padding and special chars
    let base64 = code.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) base64 += '='
    const decoded = JSON.parse(atob(base64))
    return {
      peptides: decoded.p || [],
      title: decoded.t || 'Shared Stack'
    }
  } catch (e) {
    console.error('Failed to decode stack:', e)
    return null
  }
}

export default function SharePage() {
  const params = useParams()
  const router = useRouter()
  const [stack, setStack] = useState<SharedStack | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params?.code) {
      const decoded = decodeStackFromCode(params.code as string)
      setStack(decoded)
    }
    setLoading(false)
  }, [params?.code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-pulse">
          <FlaskConical className="h-12 w-12 text-blue-500" />
        </div>
      </div>
    )
  }

  if (!stack || stack.peptides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8">
          <FlaskConical className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Stack Not Found
          </h1>
          <p className="text-slate-500 mb-4">
            This shared stack link may have expired or is invalid.
          </p>
          <Button onClick={() => router.push('/stacks')}>
            Build Your Own Stack
          </Button>
        </div>
      </div>
    )
  }

  const peptideData = stack.peptides
    .map(id => PEPTIDES[id])
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-lg px-4 dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
            <FlaskConical className="h-4 w-4 text-white" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            A friend shared this with you
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {stack.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Your friend is researching this peptide combination.
            <br />
            Sign up to see the full protocol and track your own journey!
          </p>
        </div>

        {/* Stack Preview - Teaser */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg mb-6">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {peptideData.length} Peptide Stack
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <Zap className="h-4 w-4" />
                Synergistic
              </div>
            </div>
          </div>

          {/* Show peptide names but blur details */}
          <div className="p-4 space-y-3">
            {peptideData.map((peptide, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {peptide.name}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLORS[peptide.category] || 'bg-slate-100')}>
                      {peptide.category}
                    </span>
                  </div>
                </div>

                {/* Blurred benefits */}
                <div className="relative">
                  <div className="flex flex-wrap gap-1">
                    {peptide.benefits.map((benefit, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700/50 text-transparent select-none blur-[4px]"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-slate-900/80">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                      <Lock className="h-3 w-3" />
                      Sign up to see
                    </div>
                  </div>
                </div>

                {/* Blurred dosing */}
                <div className="mt-3 relative">
                  <div className="grid grid-cols-2 gap-2 text-sm text-transparent select-none blur-[4px]">
                    <div>Dose: 250-500mcg</div>
                    <div>Timing: Morning</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Locked section */}
          <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Lock className="h-4 w-4" />
              <span className="text-sm">
                Dosing protocols, timing, and research notes hidden
              </span>
            </div>
          </div>
        </div>

        {/* What you get when you sign up */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
            Sign up to unlock:
          </h2>
          <div className="grid gap-3">
            {[
              { icon: Eye, text: 'Full dosing protocols and timing schedules' },
              { icon: Zap, text: 'Synergy analysis and research notes' },
              { icon: TrendingUp, text: 'Track your own peptide journey' },
              { icon: Shield, text: 'Build and share your own stacks' },
              { icon: Users, text: 'See what stacks friends share with you' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={() => router.push('/sign-up')}
          >
            Sign Up Free - Unlock Full Stack
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
        <p className="mt-1">Peptide AI - Research smarter, not harder.</p>
      </footer>
    </div>
  )
}
