'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface FollowUpChipsProps {
  followUps: string[]
  onClick: (question: string) => void
}

export function FollowUpChips({ followUps, onClick }: FollowUpChipsProps) {
  if (followUps.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-slate-500">Related questions</h4>
      <div className="flex flex-wrap gap-2">
        {followUps.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-auto gap-1 whitespace-normal py-2 text-left text-xs"
            onClick={() => onClick(question)}
          >
            <span className="line-clamp-2">{question}</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  )
}
