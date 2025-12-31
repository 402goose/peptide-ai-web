'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Link2, Check, Share2, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  conversationTitle: string
}

export function ShareModal({
  open,
  onOpenChange,
  conversationId,
  conversationTitle,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateLink() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.createShareLink(conversationId)
      const url = `${window.location.origin}/share/c/${result.share_id}`
      setShareUrl(url)
    } catch (err) {
      console.error('Failed to create share link:', err)
      setError('Failed to create share link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  async function handleNativeShare() {
    if (!shareUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: conversationTitle,
          text: `Check out this Sequence conversation: ${conversationTitle}`,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', err)
      }
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      // Reset state when closing
      setShareUrl(null)
      setCopied(false)
      setError(null)
    }
    onOpenChange(isOpen)
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share conversation</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this shared conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {!shareUrl ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <Link2 className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Create a public link to share this conversation
              </p>
              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}
              <Button onClick={handleCreateLink} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating link...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Create link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none dark:text-slate-300"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Copy link
                    </>
                  )}
                </Button>

                {canNativeShare && (
                  <Button onClick={handleNativeShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
