'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'
import { Download, X, Share, Plus, MoreVertical } from 'lucide-react'

export function InstallHint() {
  const { isMobile, isInstalled, isIOS, isAndroid, canInstall, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the hint before
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('pwa-install-dismissed')
      if (wasDismissed) setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, dismissed, or not mobile
  if (isInstalled || dismissed || !isMobile) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mx-auto max-w-sm"
      >
        {!expanded ? (
          // Collapsed hint
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Install app for best experience
          </button>
        ) : (
          // Expanded instructions
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 pr-8">
              Install Peptide AI
            </h3>

            {canInstall ? (
              // Android/Chrome with install prompt
              <button
                onClick={async () => {
                  await promptInstall()
                  handleDismiss()
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Install Now
              </button>
            ) : isIOS ? (
              // iOS instructions
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Share className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Tap <strong>Share</strong> in Safari</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Tap <strong>Add to Home Screen</strong></span>
                </div>
              </div>
            ) : isAndroid ? (
              // Android without prompt (Samsung browser, etc)
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <MoreVertical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Tap <strong>Menu</strong> (⋮)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Tap <strong>Install app</strong></span>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleDismiss}
              className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Maybe later
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
