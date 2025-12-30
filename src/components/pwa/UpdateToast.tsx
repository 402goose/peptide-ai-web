'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export function UpdateToast() {
  const { updateAvailable, applyUpdate } = usePWA()

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Update available</p>
              <p className="text-xs text-slate-400">Tap to get the latest features</p>
            </div>
            <button
              onClick={applyUpdate}
              className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Update
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
