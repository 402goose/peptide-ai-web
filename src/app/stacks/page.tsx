'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StackBuilder } from '@/components/stacks/StackBuilder'
import { CompareView } from '@/components/stacks/CompareView'
import { Feedbackable } from '@/components/feedback'
import { cn } from '@/lib/utils'
import { FlaskConical, GitCompareArrows } from 'lucide-react'

type TabType = 'build' | 'compare'

export default function StacksPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('build')

  const handleAskAboutStack = (peptideIds: string[]) => {
    // Navigate to chat with the stack as a pre-filled question
    const stackNames = peptideIds.join(', ')
    const query = encodeURIComponent(`Tell me about this peptide stack: ${stackNames}. What are the synergies, optimal timing, and what should I expect?`)
    router.push(`/chat?q=${query}`)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Tab Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 px-4">
        <button
          onClick={() => setActiveTab('build')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === 'build'
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <FlaskConical className="h-4 w-4" />
          Build Stack
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === 'compare'
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <GitCompareArrows className="h-4 w-4" />
          Compare
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'build' ? (
          <Feedbackable name="Stack Builder" path="components/stacks/StackBuilder.tsx">
            <StackBuilder onAskAboutStack={handleAskAboutStack} />
          </Feedbackable>
        ) : (
          <Feedbackable name="Compare View" path="components/stacks/CompareView.tsx">
            <CompareView />
          </Feedbackable>
        )}
      </div>
    </div>
  )
}
