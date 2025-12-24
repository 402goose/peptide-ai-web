import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Beaker, Search, BookOpen, Shield, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const { userId } = await auth()

  // If logged in, redirect to chat
  if (userId) {
    redirect('/chat')
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
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
          <Link href="/chat">
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

        {/* Features */}
        <div className="mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-left dark:border-slate-800 dark:bg-slate-900">
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

          <div className="rounded-xl border border-slate-200 bg-white p-6 text-left dark:border-slate-800 dark:bg-slate-900">
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

          <div className="rounded-xl border border-slate-200 bg-white p-6 text-left dark:border-slate-800 dark:bg-slate-900">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
        <p>
          This is a research platform, not medical advice. Always consult
          healthcare professionals.
        </p>
      </footer>
    </div>
  )
}
