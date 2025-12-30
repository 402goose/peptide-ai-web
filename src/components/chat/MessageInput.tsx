'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, Square, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'
import { haptic } from '@/lib/haptics'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
  showSkipHint?: boolean
}

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  function MessageInput({ onSend, disabled, placeholder, onFocus, onBlur, showSkipHint }, ref) {
    const [message, setMessage] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Voice recording hook
    const {
      isRecording,
      isTranscribing,
      audioLevel,
      startRecording,
      stopRecording,
      cancelRecording,
    } = useVoiceRecording({
      onTranscription: (text) => {
        // Append transcribed text to existing message
        setMessage(prev => prev ? `${prev} ${text}` : text)
        // Focus the textarea after transcription
        textareaRef.current?.focus()
      },
      onError: (error) => {
        console.error('Voice recording error:', error)
      },
    })

    // Forward ref to parent
    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
      }
    }, [message])

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (message.trim() && !disabled) {
        haptic('medium')
        onSend(message.trim())
        setMessage('')
      }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    }

    function handleFocus() {
      setIsFocused(true)
      onFocus?.()
    }

    function handleBlur() {
      setIsFocused(false)
      onBlur?.()
    }

    async function handleVoiceClick() {
      haptic('impact')
      if (isRecording) {
        await stopRecording()
      } else {
        await startRecording()
      }
    }

    // Cancel recording if component unmounts or user navigates away
    useEffect(() => {
      return () => {
        if (isRecording) {
          cancelRecording()
        }
      }
    }, [isRecording, cancelRecording])

    return (
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-slate-50 dark:bg-slate-900 p-3 transition-all duration-200",
            isFocused
              ? "border-slate-300 dark:border-slate-600 shadow-lg"
              : "border-slate-200 dark:border-slate-700",
            isRecording && "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30"
          )}
        >
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isRecording ? "Listening..." : (placeholder || "Ask anything")}
            disabled={disabled || isRecording || isTranscribing}
            rows={1}
            className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 text-base"
          />

          {/* Voice Recording Button */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleVoiceClick}
            disabled={disabled || isTranscribing}
            className={cn(
              "shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-full transition-all duration-200 relative",
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : isTranscribing
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-500"
                : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
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
                  <Loader2 className="h-5 w-5 animate-spin" />
                </motion.div>
              ) : isRecording ? (
                <motion.div
                  key="recording"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <Square className="h-4 w-4" />
                  {/* Audio level indicator ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white"
                    animate={{
                      scale: 1 + audioLevel * 0.5,
                      opacity: 0.5 + audioLevel * 0.5,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="mic"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Mic className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">
              {isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice input'}
            </span>
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !message.trim() || isRecording || isTranscribing}
            className={cn(
              "shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-full transition-all duration-200",
              message.trim() && !isRecording
                ? "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400"
            )}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium shadow-lg"
            >
              <motion.div
                className="h-2 w-2 rounded-full bg-white"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              Recording... Tap to stop
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-2 text-center text-xs text-slate-400">
          Research platform · Not medical advice
        </p>
      </div>
    )
  }
)
