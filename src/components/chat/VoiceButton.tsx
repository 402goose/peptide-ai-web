'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Loader2 } from 'lucide-react'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'
import { cn } from '@/lib/utils'

interface VoiceButtonProps {
  onTranscription: (text: string) => void
  size?: 'default' | 'large'
  className?: string
}

export function VoiceButton({ onTranscription, size = 'default', className }: VoiceButtonProps) {
  const {
    isRecording,
    isTranscribing,
    audioLevel,
    startRecording,
    stopRecording,
  } = useVoiceRecording({
    onTranscription,
    onError: (error) => {
      console.error('Voice recording error:', error)
    },
  })

  async function handleClick() {
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording()
    }
  }

  const isLarge = size === 'large'

  return (
    <div className={cn("relative", className)}>
      {/* Pulsing ring when recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 1.3 + audioLevel * 0.5, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className={cn(
              "absolute inset-0 rounded-full bg-red-500",
              isLarge ? "-inset-3" : "-inset-1"
            )}
          />
        )}
      </AnimatePresence>

      <button
        onClick={handleClick}
        disabled={isTranscribing}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-200",
          isLarge ? "h-24 w-24" : "h-14 w-14",
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
            : isTranscribing
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-500"
            : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
        )}
      >
        <AnimatePresence mode="wait">
          {isTranscribing ? (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className={cn("animate-spin", isLarge ? "h-10 w-10" : "h-6 w-6")} />
            </motion.div>
          ) : isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Square className={cn(isLarge ? "h-8 w-8" : "h-5 w-5")} />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Mic className={cn(isLarge ? "h-10 w-10" : "h-6 w-6")} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Label */}
      <AnimatePresence>
        {isRecording && isLarge && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium text-red-500"
          >
            Tap to stop
          </motion.p>
        )}
        {!isRecording && !isTranscribing && isLarge && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400"
          >
            Tap to speak
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
