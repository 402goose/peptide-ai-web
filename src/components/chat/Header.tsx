'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Menu, Moon, Sun, BookOpen, Shield, Settings, Share, MoreVertical } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { SequenceIcon } from '@/components/brand/SequenceLogo'

const ADMIN_EMAILS = ['vibetradefox@gmail.com']

interface HeaderProps {
  onMenuClick: () => void
  onToolsClick?: () => void
  onShareClick?: () => void
  showShare?: boolean
}

export function Header({ onMenuClick, onToolsClick, onShareClick, showShare = false }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useUser()

  const isAdmin = user?.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress)

  return (
    <header
      className="w-full flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-white via-indigo-50/30 to-white px-3 sm:px-4 dark:border-slate-800 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 shrink-0 z-40"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0.5rem)',
        minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))'
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sequence-gradient shadow-sm shrink-0">
            <SequenceIcon size={20} className="[&_*]:stroke-white [&_circle]:fill-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">
              Sequence
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block">
              Research Engine
            </span>
          </div>
        </div>
        {/* Trust badges - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <BookOpen className="h-3 w-3" />
            <span>1,200+ Papers</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Shield className="h-3 w-3" />
            <span>Evidence-Based</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {showShare && onShareClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onShareClick}
            title="Share chat"
          >
            <Share className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <span className="sr-only">Share</span>
          </Button>
        )}
        {isAdmin && (
          <Link href="/admin" className="hidden sm:block">
            <Button variant="ghost" size="icon" title="Admin Dashboard" className="h-9 w-9">
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="sr-only">Admin</span>
            </Button>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hidden sm:flex"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        {/* Tools button - mobile only */}
        {onToolsClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:hidden bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            onClick={onToolsClick}
          >
            <MoreVertical className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span className="sr-only">Tools & Settings</span>
          </Button>
        )}
        <div className="flex items-center">
          {user ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          ) : (
            <Link href="/sign-in">
              <Button size="sm" className="h-8">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
