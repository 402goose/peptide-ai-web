import Link from 'next/link'
import { Beaker, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ShareNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Beaker className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Peptide AI</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Beaker className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Conversation not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
            This shared conversation may have been removed or the link is invalid.
          </p>
          <Link href="/chat">
            <Button className="gap-2">
              Start a new conversation <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
