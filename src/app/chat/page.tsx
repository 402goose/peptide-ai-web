'use client'

import { Suspense } from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Feedbackable } from '@/components/feedback'

function ChatContent() {
  return (
    <Feedbackable name="Chat Interface" path="components/chat/ChatContainer.tsx" className="h-full">
      <ChatContainer />
    </Feedbackable>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  )
}
