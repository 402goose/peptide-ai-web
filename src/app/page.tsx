'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileInstallGuide } from '@/components/pwa/MobileInstallGuide'
import { usePWA } from '@/hooks/usePWA'
import { Beaker, Search, BookOpen, Shield, ArrowRight, Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const { isMobile, isInstalled } = usePWA()
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if mobile user has completed or skipped setup
    if (typeof window !== 'undefined') {
      const setupComplete = localStorage.getItem('pwa-setup-complete')
      const setupSkipped = localStorage.getItem('pwa-setup-skipped')

      // Show install guide if:
      // - Mobile device
      // - Not already installed as PWA
      // - Haven't completed or skipped setup
      if (isMobile && !isInstalled && !setupComplete && !setupSkipped) {
        setShowInstallGuide(true)
      }
    }
  }, [isMobile, isInstalled])

  // Redirect logged in users to chat
  useEffect(() => {
    if (isLoaded && isSignedIn && !showInstallGuide) {
      router.push('/chat')
    }
  }, [isLoaded, isSignedIn, showInstallGuide, router])

  // Show loading while checking auth
  if (!isClient || !isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Show mobile install guide for first-time mobile visitors
  if (showInstallGuide) {
    return (
      <MobileInstallGuide
        onComplete={() => {
          setShowInstallGuide(false)
          if (isSignedIn) {
            router.push('/chat')
          }
        }}
      />
    )
  }

  // Landing page for non-authenticated users
  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Beaker className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-slate-900 dark:text-white">
              Peptide AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="flex flex-col items-center px-4 py-12 md:py-16 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Research-grade peptide intelligence
          </div>

          <h1 className="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-6xl">
            Your AI Research Assistant for{' '}
            <span className="text-blue-600">Peptide Science</span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Access peer-reviewed research and real user experiences. Ask questions
            about peptides, protocols, mechanisms, and safety—all powered by
            advanced RAG technology.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Researching <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features - horizontal scroll on mobile, grid on desktop */}
          <div className="mt-12 md:mt-16 w-full max-w-4xl">
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 snap-x snap-mandatory scrollbar-hide">
              <div className="flex-shrink-0 w-[280px] md:w-auto snap-center rounded-xl border border-slate-200 bg-white p-5 md:p-6 text-left dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Research Database
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Search through thousands of peer-reviewed papers from PubMed,
                  arXiv, and bioRxiv.
                </p>
              </div>

              <div className="flex-shrink-0 w-[280px] md:w-auto snap-center rounded-xl border border-slate-200 bg-white p-5 md:p-6 text-left dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  User Experiences
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Learn from real user journeys and reported outcomes across the
                  peptide community.
                </p>
              </div>

              <div className="flex-shrink-0 w-[280px] md:w-auto snap-center rounded-xl border border-slate-200 bg-white p-5 md:p-6 text-left dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Safety First
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get balanced information with proper disclaimers and citations for
                  every claim.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
          <p>
            This is a research platform, not medical advice. Always consult
            healthcare professionals.
          </p>
        </footer>
      </div>
    </div>
  )
}
