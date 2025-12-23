'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Menu, Moon, Sun, Beaker, BookOpen, Shield, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

const ADMIN_EMAILS = ['vibetradefox@gmail.com']

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useUser()

  const isAdmin = user?.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress)

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
            <Beaker className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              Peptide AI
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block">
              Research Assistant
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

      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link href="/admin">
            <Button variant="ghost" size="icon" title="Admin Dashboard">
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="sr-only">Admin</span>
            </Button>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
