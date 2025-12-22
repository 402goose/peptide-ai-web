'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

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

    return (
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-white dark:bg-slate-900 p-2 transition-all duration-200",
            isFocused
              ? "border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/10"
              : "border-slate-200 dark:border-slate-700"
          )}
        >
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          />
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !message.trim()}
            className={cn(
              "shrink-0 rounded-xl transition-all duration-200",
              message.trim()
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>

        {/* Skip hint for onboarding */}
        {showSkipHint && (
          <div className="absolute -top-8 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>Skip setup and ask directly</span>
            </div>
          </div>
        )}

        <p className="mt-2 text-center text-xs text-slate-400">
          Research platform · Not medical advice
        </p>
      </div>
    )
  }
)
