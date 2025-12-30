'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA, useMicPermission } from '@/hooks/usePWA'
import { Button } from '@/components/ui/button'
import {
  Share,
  Plus,
  Mic,
  ChevronRight,
  Check,
  Beaker,
  Smartphone,
  MessageSquare,
  Sparkles
} from 'lucide-react'

interface Step {
  id: string
  title: string
  description: string
  action?: () => void
  isComplete?: boolean
}

export function MobileInstallGuide({ onComplete }: { onComplete: () => void }) {
  const { isIOS, isAndroid, canInstall, promptInstall } = usePWA()
  const { permission, requestPermission, isRequesting } = useMicPermission()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const markComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]))
    if (stepIndex < steps.length - 1) {
      setTimeout(() => setCurrentStep(stepIndex + 1), 300)
    }
  }

  const handleMicPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      markComplete(currentStep)
    }
  }

  const steps: Step[] = isIOS ? [
    {
      id: 'welcome',
      title: 'Welcome to Peptide AI',
      description: 'Your AI-powered research journal. Talk naturally about your peptide journey and get insights.',
    },
    {
      id: 'share',
      title: 'Tap the Share Button',
      description: 'Look for the share icon at the bottom of your screen',
    },
    {
      id: 'add-home',
      title: 'Add to Home Screen',
      description: 'Scroll down and tap "Add to Home Screen"',
    },
    {
      id: 'mic',
      title: 'Enable Voice Journaling',
      description: 'Allow microphone access to speak your thoughts instead of typing',
    },
    {
      id: 'done',
      title: 'You\'re All Set!',
      description: 'Open Peptide AI from your home screen to get started',
    },
  ] : [
    {
      id: 'welcome',
      title: 'Welcome to Peptide AI',
      description: 'Your AI-powered research journal. Talk naturally about your peptide journey and get insights.',
    },
    {
      id: 'install',
      title: 'Install the App',
      description: canInstall ? 'Tap the button below to install' : 'Tap the menu icon (⋮) and select "Install app"',
    },
    {
      id: 'mic',
      title: 'Enable Voice Journaling',
      description: 'Allow microphone access to speak your thoughts instead of typing',
    },
    {
      id: 'done',
      title: 'You\'re All Set!',
      description: 'Open Peptide AI from your home screen to get started',
    },
  ]

  const skipSetup = () => {
    localStorage.setItem('pwa-setup-skipped', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Beaker className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">Peptide AI</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={skipSetup}
          className="text-slate-400 hover:text-white"
        >
          Skip
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentStep
                ? 'w-6 bg-blue-500'
                : completedSteps.has(index)
                ? 'bg-green-500'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            {/* Welcome step */}
            {steps[currentStep].id === 'welcome' && (
              <div className="text-center">
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                      <Beaker className="h-16 w-16 text-white" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Mic className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">
                  {steps[currentStep].title}
                </h1>
                <p className="text-slate-400 mb-8">
                  {steps[currentStep].description}
                </p>
                <div className="space-y-3 text-left mb-8">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-slate-300">Voice journaling with Whisper AI</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-slate-300">Smart insights from your logs</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                    <Smartphone className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-slate-300">Works offline like a native app</span>
                  </div>
                </div>
                <Button
                  className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
                  onClick={() => markComplete(currentStep)}
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* iOS Share step */}
            {steps[currentStep].id === 'share' && (
              <div className="text-center">
                <div className="mb-8">
                  {/* Phone mockup with share button highlighted */}
                  <div className="relative mx-auto w-48 h-96 rounded-[2.5rem] bg-slate-800 border-4 border-slate-700 overflow-hidden shadow-2xl">
                    <div className="absolute inset-x-0 top-0 h-8 bg-slate-900 flex items-center justify-center">
                      <div className="w-20 h-5 rounded-full bg-slate-800" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Beaker className="h-12 w-12 text-blue-500 opacity-20" />
                    </div>
                    {/* Bottom toolbar with share icon */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-slate-900 flex items-center justify-around px-6">
                      <div className="w-6 h-6 rounded bg-slate-700" />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="relative"
                      >
                        <Share className="h-6 w-6 text-blue-500" />
                        <div className="absolute -inset-3 rounded-full border-2 border-blue-500 animate-ping" />
                      </motion.div>
                      <div className="w-6 h-6 rounded bg-slate-700" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-400 mb-6">
                  {steps[currentStep].description}
                </p>
                <Button
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700"
                  onClick={() => markComplete(currentStep)}
                >
                  I Found It
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* iOS Add to Home Screen step */}
            {steps[currentStep].id === 'add-home' && (
              <div className="text-center">
                <div className="mb-8">
                  {/* Share sheet mockup */}
                  <div className="mx-auto w-72 rounded-t-3xl bg-slate-800 overflow-hidden shadow-2xl">
                    <div className="h-1.5 w-12 rounded-full bg-slate-600 mx-auto mt-3" />
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700">
                        <div className="w-8 h-8 rounded bg-slate-600" />
                        <span className="text-slate-400 text-sm">Copy</span>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-blue-600"
                      >
                        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
                          <Plus className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white text-sm font-medium">Add to Home Screen</span>
                      </motion.div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700">
                        <div className="w-8 h-8 rounded bg-slate-600" />
                        <span className="text-slate-400 text-sm">Add Bookmark</span>
                      </div>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-400 mb-6">
                  {steps[currentStep].description}
                </p>
                <Button
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700"
                  onClick={() => markComplete(currentStep)}
                >
                  Done
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Android install step */}
            {steps[currentStep].id === 'install' && (
              <div className="text-center">
                <div className="mb-8">
                  <div className="relative mx-auto w-48 h-96 rounded-3xl bg-slate-800 border-4 border-slate-700 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Beaker className="h-12 w-12 text-blue-500 opacity-20" />
                    </div>
                    {/* Top bar with menu icon */}
                    <div className="absolute inset-x-0 top-0 h-12 bg-slate-900 flex items-center justify-end px-4">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-2xl text-blue-500"
                      >
                        ⋮
                      </motion.div>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-400 mb-6">
                  {steps[currentStep].description}
                </p>
                {canInstall ? (
                  <Button
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      await promptInstall()
                      markComplete(currentStep)
                    }}
                  >
                    Install App
                    <Plus className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700"
                    onClick={() => markComplete(currentStep)}
                  >
                    I Installed It
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Microphone permission step */}
            {steps[currentStep].id === 'mic' && (
              <div className="text-center">
                <div className="mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl"
                  >
                    <Mic className="h-16 w-16 text-white" />
                  </motion.div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-400 mb-6">
                  {steps[currentStep].description}
                </p>
                <div className="p-4 rounded-xl bg-slate-800/50 mb-6 text-left">
                  <p className="text-sm text-slate-300">
                    <span className="text-purple-400 font-medium">Voice journaling</span> lets you speak naturally:
                  </p>
                  <p className="text-sm text-slate-400 mt-2 italic">
                    "Just took my BPC, 250mcg, feeling pretty good today, slept well last night..."
                  </p>
                </div>
                {permission === 'granted' ? (
                  <Button
                    className="w-full py-5 bg-green-600 hover:bg-green-700"
                    onClick={() => markComplete(currentStep)}
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Microphone Enabled
                  </Button>
                ) : (
                  <Button
                    className="w-full py-5 bg-purple-600 hover:bg-purple-700"
                    onClick={handleMicPermission}
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      'Requesting...'
                    ) : (
                      <>
                        Allow Microphone
                        <Mic className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full mt-3 text-slate-400"
                  onClick={() => markComplete(currentStep)}
                >
                  Skip for now
                </Button>
              </div>
            )}

            {/* Done step */}
            {steps[currentStep].id === 'done' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="mb-8 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl"
                >
                  <Check className="h-16 w-16 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-400 mb-8">
                  {steps[currentStep].description}
                </p>
                <Button
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => {
                    localStorage.setItem('pwa-setup-complete', 'true')
                    onComplete()
                  }}
                >
                  Start Using Peptide AI
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
