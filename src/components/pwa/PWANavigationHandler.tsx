'use client'

import { useEffect } from 'react'

/**
 * PWA Navigation Handler
 *
 * On iOS, when a PWA navigates to an external URL or the user clicks a link
 * that would open in Safari, it can break the standalone mode and show Safari bars.
 *
 * This component:
 * 1. Intercepts clicks on external links and opens them in Safari (not in PWA)
 * 2. Ensures internal navigation stays within the PWA
 * 3. Logs when the app is in standalone mode
 */
export function PWANavigationHandler() {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Check if we're in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      console.log('[PWA] Running in standalone mode')
    }

    // Handle link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Check if it's an external link
      const isExternal = href.startsWith('http') && !href.includes(window.location.host)
      const isMailto = href.startsWith('mailto:')
      const isTel = href.startsWith('tel:')

      // For external links in standalone mode, we want to open in Safari
      // This prevents the PWA from navigating to external sites and showing Safari bars
      if (isStandalone && (isExternal || isMailto || isTel)) {
        // Let the browser handle mailto and tel naturally
        if (isMailto || isTel) return

        // For external HTTP links, the target="_blank" should handle it
        // but if it doesn't have target="_blank", add it
        if (!anchor.getAttribute('target')) {
          e.preventDefault()
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    // Handle beforeunload to warn about navigation away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if we're in standalone and navigating externally
      // Actually, this is too aggressive - disable for now
    }

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  return null
}
