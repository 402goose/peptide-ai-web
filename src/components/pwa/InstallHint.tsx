'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'
import { Download, X, Share, Plus, MoreVertical } from 'lucide-react'

export function InstallHint() {
  const { isMobile, isInstalled, isIOS, isAndroid, canInstall, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
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

  // Android with native install prompt
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

  // iOS - Full screen instruction overlay (react-ios-pwa-prompt style)
  if (isIOS && showInstructions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowInstructions(false)}
        />

        {/* Content - positioned to leave space for Safari toolbar at bottom */}
        <div className="relative flex-1 flex flex-col justify-end pb-24 px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto w-full"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M35 20V40L20 70C17.5 76 21 82 28 82H72C79 82 82.5 76 80 70L65 40V20"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M32 20H68" stroke="white" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="40" cy="60" r="5" fill="white" fillOpacity="0.6" />
                  <circle cx="55" cy="66" r="4" fill="white" fillOpacity="0.6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Install Sequence</h2>
              <p className="text-blue-100 text-sm mt-1">Add to your home screen for the best experience</p>
            </div>

            {/* Steps */}
            <div className="p-5 space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Tap the <Share className="inline h-4 w-4 -mt-0.5 text-blue-500" /> Share button
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    In Safari's toolbar at the bottom of your screen
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Scroll down and tap
                  </p>
                  {/* Mockup of the option */}
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                      Add to Home Screen
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Tap "Add" in the top right
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    That's it! Open from your home screen anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => setShowInstructions(false)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Maybe Later
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 text-sm font-medium text-blue-500 hover:text-blue-600"
              >
                Don't Show Again
              </button>
            </div>
          </motion.div>

          {/* Arrow pointing to Share button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            className="flex flex-col items-center mt-4"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white text-sm font-medium mt-1">Tap Share below</span>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Android without prompt - similar but for menu
  if (isAndroid && showInstructions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowInstructions(false)}
        />

        <div className="relative flex-1 flex flex-col justify-start pt-16 px-4">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto w-full"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white text-center">
              <h2 className="text-xl font-bold">Install Sequence</h2>
              <p className="text-blue-100 text-sm mt-1">Add to your home screen</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Tap the <MoreVertical className="inline h-4 w-4 -mt-0.5 text-blue-500" /> Menu
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    In your browser's toolbar (top right)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Tap "Install app" or "Add to Home screen"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                Got it
              </button>
            </div>
          </motion.div>

          {/* Arrow pointing up to menu */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            className="absolute top-4 right-8 flex flex-col items-center"
          >
            <span className="text-white text-sm font-medium mb-1">Tap Menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white rotate-180">
              <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Default prompt button
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-sm"
    >
      <button
        onClick={() => setShowInstructions(true)}
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
  )
}
