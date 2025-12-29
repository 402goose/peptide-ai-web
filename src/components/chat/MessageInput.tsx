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
            "flex items-end gap-3 rounded-2xl border bg-slate-50 dark:bg-slate-900 p-3 transition-all duration-200",
            isFocused
              ? "border-slate-300 dark:border-slate-600 shadow-lg"
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
            placeholder={placeholder || "Ask anything"}
            disabled={disabled}
            rows={1}
            className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 text-base"
          />
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !message.trim()}
            className={cn(
              "shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-full transition-all duration-200",
              message.trim()
                ? "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400"
            )}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>

        <p className="mt-2 text-center text-xs text-slate-400">
          Research platform · Not medical advice
        </p>
      </div>
    )
  }
)
