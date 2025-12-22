'use client'

import { Suspense } from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'

function ChatContent() {
  return <ChatContainer />
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  )
}
