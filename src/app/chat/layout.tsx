'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { Header } from '@/components/chat/Header'
import { ShareModal } from '@/components/chat/ShareModal'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()

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
    <div className="min-h-[100svh] h-[100svh] flex bg-white dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 dark:md:border-slate-800">
        <ConversationSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <ConversationSidebar onSelect={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
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
