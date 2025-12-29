'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Feedbackable } from '@/components/feedback'

function ChatContent() {
  const params = useParams()
  const segments = params?.segments as string[] | undefined

  // Parse URL: /chat/c/[id] → conversationId = id
  // /chat → conversationId = undefined
  let conversationId: string | undefined
  if (segments && segments.length >= 2 && segments[0] === 'c') {
    conversationId = segments[1]
  }

  return (
    <Feedbackable name="Chat Interface" path="components/chat/ChatContainer.tsx" className="h-full">
      <ChatContainer conversationId={conversationId} />
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
