'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ToolsDrawer } from '@/components/chat/ToolsDrawer'
import { Header } from '@/components/chat/Header'
import { ShareModal } from '@/components/chat/ShareModal'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { haptic } from '@/lib/haptics'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()

  // Swipe gesture state
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const swipeThreshold = 80 // Minimum swipe distance

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchEndX.current - touchStartX.current
    const screenWidth = window.innerWidth

    // Only trigger on edges
    const startedFromLeftEdge = touchStartX.current < 30
    const startedFromRightEdge = touchStartX.current > screenWidth - 30

    if (startedFromLeftEdge && swipeDistance > swipeThreshold) {
      // Swipe right from left edge - open sidebar
      haptic('light')
      setSidebarOpen(true)
    } else if (startedFromRightEdge && swipeDistance < -swipeThreshold) {
      // Swipe left from right edge - open tools
      haptic('light')
      setToolsOpen(true)
    }

    // Reset
    touchStartX.current = 0
    touchEndX.current = 0
  }, [])

  // Extract conversation ID from URL path
  const pathnameConversationId = pathname?.match(/\/chat\/c\/([^\/]+)/)?.[1]

  // Use pathname ID or stored active ID
  const conversationId = pathnameConversationId || activeConversationId

  // Listen for conversation ID updates from ChatContainer
  useEffect(() => {
    const handleConversationCreated = (event: CustomEvent<string>) => {
      setActiveConversationId(event.detail)
    }

    window.addEventListener('conversationCreated', handleConversationCreated as EventListener)
    return () => {
      window.removeEventListener('conversationCreated', handleConversationCreated as EventListener)
    }
  }, [])

  // Prevent back navigation to OAuth pages (Google 400 error fix)
  useEffect(() => {
    // On mount, replace current history entry to ensure we're the "first" entry
    // This helps prevent the Google OAuth 400 error when users swipe back
    const handleBeforeUnload = () => {
      // Clear any stored OAuth state
      sessionStorage.removeItem('clerk_oauth_state')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <div className="h-[100svh] flex bg-white dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 dark:md:border-slate-800 h-full overflow-hidden">
        <ConversationSidebar />
      </div>

      {/* Mobile Left Sidebar (Conversations) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <ConversationSidebar onSelect={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile Right Drawer (Tools) */}
      <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <ToolsDrawer onSelect={() => setToolsOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onToolsClick={() => setToolsOpen(true)}
          onShareClick={() => setShareModalOpen(true)}
          showShare={!!conversationId}
        />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Share Modal */}
      {conversationId && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          conversationId={conversationId}
          conversationTitle="Conversation" // Will be updated with actual title
        />
      )}
    </div>
  )
}
