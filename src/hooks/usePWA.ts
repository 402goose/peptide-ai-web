'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  isInstalled: boolean
  isIOS: boolean
  isAndroid: boolean
  isMobile: boolean
  canInstall: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    canInstall: false,
    installPrompt: null,
  })

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isMobile = isIOS || isAndroid || window.innerWidth < 768

    // Check if running as installed PWA
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isMobile,
      isInstalled,
    }))

    // Listen for install prompt (Android/Desktop Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setState(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e as BeforeInstallPromptEvent,
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const promptInstall = async () => {
    if (state.installPrompt) {
      await state.installPrompt.prompt()
      const { outcome } = await state.installPrompt.userChoice
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstalled: true, canInstall: false }))
      }
    }
  }

  return { ...state, promptInstall }
}

export function useMicPermission() {
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    // Check current permission state
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setPermission(result.state as 'prompt' | 'granted' | 'denied')
        result.onchange = () => {
          setPermission(result.state as 'prompt' | 'granted' | 'denied')
        }
      }).catch(() => {
        // Permissions API not supported for microphone
      })
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop all tracks immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      setPermission('granted')
      return true
    } catch (error) {
      setPermission('denied')
      return false
    } finally {
      setIsRequesting(false)
    }
  }

  return { permission, requestPermission, isRequesting }
}
