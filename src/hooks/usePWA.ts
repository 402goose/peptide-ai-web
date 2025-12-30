'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  isInstalled: boolean
  isIOS: boolean
  isAndroid: boolean
  isMobile: boolean
  canInstall: boolean
  installPrompt: BeforeInstallPromptEvent | null
  updateAvailable: boolean
  swRegistration: ServiceWorkerRegistration | null
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
    updateAvailable: false,
    swRegistration: null,
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

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully')
      setState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null,
      }))
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    // Register service worker and listen for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        setState(prev => ({ ...prev, swRegistration: registration }))

        // Check for updates immediately
        registration.update()

        // Listen for new service worker waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('[PWA] Update available')
                setState(prev => ({ ...prev, updateAvailable: true }))
              }
            })
          }
        })
      }).catch(console.error)

      // Handle controller change (after skipWaiting)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated, reloading...')
        window.location.reload()
      })
    }

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isInstalled: e.matches }))
    }
    displayModeQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      displayModeQuery.removeEventListener('change', handleDisplayModeChange)
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

  const applyUpdate = () => {
    if (state.swRegistration?.waiting) {
      // Tell the waiting service worker to skip waiting
      state.swRegistration.waiting.postMessage('skipWaiting')
    }
  }

  return { ...state, promptInstall, applyUpdate }
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
