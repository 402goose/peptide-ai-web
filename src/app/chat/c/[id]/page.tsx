'use client'

import { useParams } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params?.id as string

  return <ChatContainer conversationId={conversationId} />
}
