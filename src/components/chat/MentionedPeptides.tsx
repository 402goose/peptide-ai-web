'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Beaker, Plus, MessageSquare } from 'lucide-react'
import { haptic } from '@/lib/haptics'
import { AuthPromptModal } from '@/components/auth/AuthPromptModal'
import { cn } from '@/lib/utils'

// Category colors (matching PeptidePill)
const CATEGORY_INFO: Record<string, { color: string; category: string }> = {
  'bpc-157': { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800', category: 'Healing' },
  'tb-500': { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800', category: 'Healing' },
  'ghk-cu': { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800', category: 'Healing' },
  'kpv': { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800', category: 'Healing' },
  'semaglutide': { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800', category: 'Weight Loss' },
  'tirzepatide': { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800', category: 'Weight Loss' },
  'aod-9604': { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800', category: 'Weight Loss' },
  'ipamorelin': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800', category: 'Performance' },
  'cjc-1295': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800', category: 'Performance' },
  'mk-677': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800', category: 'Performance' },
  'tesamorelin': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800', category: 'Performance' },
  'semax': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800', category: 'Cognitive' },
  'selank': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800', category: 'Cognitive' },
  'dihexa': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800', category: 'Cognitive' },
  'epithalon': { color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800', category: 'Anti-Aging' },
  'thymosin-alpha-1': { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800', category: 'Immune' },
  'll-37': { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800', category: 'Immune' },
  'pt-141': { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800', category: 'Sexual Health' },
  'ss-31': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800', category: 'Mitochondrial' },
  'dsip': { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', category: 'Sleep' },
  'mots-c': { color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300 border-lime-200 dark:border-lime-800', category: 'Metabolic' },
}

const DEFAULT_COLOR = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'

interface MentionedPeptidesProps {
  peptides: string[]
  onLearnMore: (message: string) => void
  onAddToStack?: (peptideId: string) => void
}

export function MentionedPeptides({ peptides, onLearnMore, onAddToStack }: MentionedPeptidesProps) {
  const { user, isLoaded } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingPeptide, setPendingPeptide] = useState<string | null>(null)

  if (peptides.length === 0) return null

  // Dedupe and limit
  const uniquePeptides = [...new Set(peptides)].slice(0, 6)

  const handleAddToStack = (peptide: string) => {
    haptic('success')
    if (isLoaded && !user) {
      setPendingPeptide(peptide)
      setShowAuthModal(true)
      return
    }
    onAddToStack?.(peptide.toLowerCase().replace(/[^a-z0-9]/g, '-'))
  }

  const handleLearnMore = (peptide: string) => {
    haptic('light')
    onLearnMore(`Tell me more about ${peptide} - dosing, timing, and what to expect`)
  }

  const getPeptideInfo = (name: string) => {
    const normalized = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
    return CATEGORY_INFO[normalized] || { color: DEFAULT_COLOR, category: 'Peptide' }
  }

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-1.5">
        <Beaker className="h-3 w-3 text-slate-400" />
        <span className="text-xs text-slate-400 dark:text-slate-500">Peptides mentioned</span>
      </div>

      {/* Horizontal scrollable container */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {uniquePeptides.map((peptide, index) => {
          const info = getPeptideInfo(peptide)
          return (
            <motion.div
              key={peptide}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 rounded-full border",
                "min-h-[44px] sm:min-h-0",
                info.color
              )}
            >
              {/* Peptide name - clickable to learn more */}
              <button
                onClick={() => handleLearnMore(peptide)}
                className="flex items-center gap-1.5 pl-3 pr-1 py-2 hover:opacity-80 transition-opacity"
              >
                <Beaker className="h-3.5 w-3.5" />
                <span className="text-sm font-medium whitespace-nowrap">{peptide}</span>
              </button>

              {/* Add to stack button */}
              <button
                onClick={() => handleAddToStack(peptide)}
                className="flex items-center justify-center h-full px-2 py-2 border-l border-current/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-r-full"
                title="Add to stack"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Auth Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          setPendingPeptide(null)
        }}
        feature="add-stack"
        onContinue={() => {
          if (pendingPeptide) {
            onAddToStack?.(pendingPeptide.toLowerCase().replace(/[^a-z0-9]/g, '-'))
          }
          setPendingPeptide(null)
        }}
      />
    </motion.div>
  )
}
