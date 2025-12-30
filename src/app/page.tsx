'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Homepage just redirects to chat - no walls, no friction
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/chat')
  }, [router])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
}
