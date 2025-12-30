'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { X, LogIn, UserPlus, FlaskConical, Layers, Calculator, Sparkles, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'

export type AuthFeature = 'journey' | 'stack' | 'calculator' | 'symptoms' | 'add-stack'

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  feature: AuthFeature
  targetPath?: string
  onContinue?: () => void
}

const FEATURE_CONFIG: Record<AuthFeature, {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
  title: string
  description: string
  benefits: string[]
  allowGuest?: boolean
}> = {
  journey: {
    icon: FlaskConical,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    title: 'Journey Tracker',
    description: 'Track your peptide journey, log doses, and monitor your progress over time.',
    benefits: [
      'Log daily doses and check-ins',
      'Track energy, sleep, and mood',
      'Share your journey with friends',
    ],
    allowGuest: true,
  },
  stack: {
    icon: Layers,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    title: 'Stack Builder',
    description: 'Build and save your peptide stacks with personalized recommendations.',
    benefits: [
      'Create custom peptide stacks',
      'Get dosing recommendations',
      'Save and share your protocols',
    ],
    allowGuest: true,
  },
  calculator: {
    icon: Calculator,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Dose Calculator',
    description: 'Calculate precise peptide doses based on your weight and goals.',
    benefits: [
      'Accurate dosing calculations',
      'Weight-based recommendations',
      'Save your presets',
    ],
    allowGuest: true,
  },
  symptoms: {
    icon: Sparkles,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    title: 'Symptom Guide',
    description: 'Find the right peptides based on your symptoms and goals.',
    benefits: [
      'Symptom-based search',
      'Personalized suggestions',
      'Research-backed info',
    ],
    allowGuest: true,
  },
  'add-stack': {
    icon: Plus,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    title: 'Add to Stack',
    description: 'Save this peptide to your personal stack for easy reference.',
    benefits: [
      'Build your custom stack',
      'Track what you\'re researching',
      'Get stack recommendations',
    ],
    allowGuest: true,
  },
}

export function AuthPromptModal({ isOpen, onClose, feature, targetPath, onContinue }: AuthPromptModalProps) {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { openSignIn, openSignUp } = useClerk()
  const [isNavigating, setIsNavigating] = useState(false)

  const config = FEATURE_CONFIG[feature]
  const Icon = config.icon

  // If user is already signed in, just navigate or continue
  if (isLoaded && user) {
    if (isOpen && !isNavigating) {
      setIsNavigating(true)
      if (onContinue) {
        onContinue()
      } else if (targetPath) {
        router.push(targetPath)
      }
      onClose()
    }
    return null
  }

  if (!isOpen) return null

  const handleSignIn = () => {
    haptic('medium')
    openSignIn({
      afterSignInUrl: targetPath || '/chat',
      afterSignUpUrl: targetPath || '/chat',
    })
    onClose()
  }

  const handleSignUp = () => {
    haptic('medium')
    openSignUp({
      afterSignInUrl: targetPath || '/chat',
      afterSignUpUrl: targetPath || '/chat',
    })
    onClose()
  }

  const handleContinueAsGuest = () => {
    haptic('light')
    if (onContinue) {
      onContinue()
    } else if (targetPath) {
      router.push(targetPath)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl mb-4', config.iconBg)}>
              <Icon className={cn('h-7 w-7', config.iconColor)} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {config.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {config.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6 space-y-2">
            {config.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {benefit}
              </div>
            ))}
          </div>

          {/* Sign in prompt */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
              Sign in to save your progress and sync across devices
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="flex-1 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button
                onClick={handleSignUp}
                className="flex-1 gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </div>
          </div>

          {/* Continue as guest */}
          <button
            onClick={handleContinueAsGuest}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors py-2"
          >
            Continue as guest (data saved locally)
          </button>
        </div>
      </div>
    </div>
  )
}
