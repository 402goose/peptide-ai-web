'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'
import { Download, X, Share, Plus, MoreVertical, ChevronDown, Check } from 'lucide-react'

type InstallStep = 'prompt' | 'step1' | 'step2' | 'done'

export function InstallHint() {
  const { isMobile, isInstalled, isIOS, isAndroid, canInstall, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [step, setStep] = useState<InstallStep>('prompt')

  useEffect(() => {
    // Check if user has dismissed the hint before
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('pwa-install-dismissed')
      if (wasDismissed) setDismissed(true)
    }
  }, [])

  // Detect when user returns from share sheet (visibility change)
  useEffect(() => {
    if (step !== 'step1') return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && step === 'step1') {
        // User came back - they probably opened the share sheet
        // Move to step 2 after a brief delay
        setTimeout(() => setStep('step2'), 300)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [step])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, dismissed, or not mobile
  if (isInstalled || dismissed || !isMobile) return null

  // Android with install prompt - simple one-click
  if (canInstall) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-sm"
      >
        <button
          onClick={async () => {
            await promptInstall()
            handleDismiss()
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-colors"
        >
          <Download className="h-5 w-5" />
          Install App
        </button>
      </motion.div>
    )
  }

  // iOS or Android without prompt - multi-step guide
  return (
    <AnimatePresence mode="wait">
      {step === 'prompt' && (
        <motion.div
          key="prompt"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-auto max-w-sm"
        >
          <button
            onClick={() => setStep('step1')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-colors"
          >
            <Download className="h-5 w-5" />
            Install for Best Experience
          </button>
          <button
            onClick={handleDismiss}
            className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Continue in browser
          </button>
        </motion.div>
      )}

      {step === 'step1' && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mx-auto max-w-sm"
        >
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-lg mb-2">
                1
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Tap the Share button
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Find it in Safari's toolbar below
              </p>
            </div>

            {/* Visual pointer to Safari share button */}
            <div className="flex flex-col items-center">
              <ChevronDown className="h-6 w-6 text-blue-500 animate-bounce" />
              <div className="mt-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center gap-3">
                <Share className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Share button in Safari
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-slate-400 mt-4">
              After tapping share, scroll down to find "Add to Home Screen"
            </p>
          </div>
        </motion.div>
      )}

      {step === 'step2' && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mx-auto max-w-sm"
        >
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 font-bold text-lg mb-2">
                2
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Tap "Add to Home Screen"
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Scroll down in the share menu to find it
              </p>
            </div>

            {/* Visual of what to look for */}
            <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3">
              <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white dark:bg-slate-600">
                <Plus className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  Add to Home Screen
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep('step1')}
              className="w-full mt-4 py-2 text-sm text-blue-500 hover:text-blue-600"
            >
              ← Back to step 1
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
