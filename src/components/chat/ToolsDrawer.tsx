'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FlaskConical, Calculator, Sparkles, Settings, Moon, Sun,
  User, LogOut, LogIn, HelpCircle
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useClerk } from '@clerk/nextjs'
import { haptic } from '@/lib/haptics'

interface ToolsDrawerProps {
  onSelect?: () => void
}

export function ToolsDrawer({ onSelect }: ToolsDrawerProps) {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { signOut, openSignIn } = useClerk()
  const { theme, setTheme } = useTheme()

  const handleNavigation = (path: string) => {
    haptic('light')
    router.push(path)
    onSelect?.()
  }

  const handleThemeToggle = () => {
    haptic('light')
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleSignOut = () => {
    haptic('medium')
    signOut()
    onSelect?.()
  }

  const handleSignIn = () => {
    haptic('medium')
    openSignIn()
    onSelect?.()
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
        <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">
          Tools & Settings
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Features Section */}
          <div className="mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
              Features
            </span>
          </div>

          <Button
            onClick={() => handleNavigation('/journey')}
            className="w-full justify-start gap-3"
            variant="ghost"
          >
            <FlaskConical className="h-5 w-5 text-purple-500" />
            <div className="text-left">
              <div className="font-medium">Journey Tracker</div>
              <div className="text-xs text-slate-500">Track your peptide journey</div>
            </div>
          </Button>

          <Button
            onClick={() => handleNavigation('/stacks')}
            className="w-full justify-start gap-3"
            variant="ghost"
          >
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M17.5 14v7M14 17.5h7" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Stack Builder</div>
              <div className="text-xs text-slate-500">Build your peptide stack</div>
            </div>
          </Button>

          {/* Tools Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
              Tools
            </span>
          </div>

          <Button
            onClick={() => handleNavigation('/tools/calculator')}
            className="w-full justify-start gap-3"
            variant="ghost"
          >
            <Calculator className="h-5 w-5 text-blue-500" />
            <div className="text-left">
              <div className="font-medium">Dose Calculator</div>
              <div className="text-xs text-slate-500">Calculate peptide doses</div>
            </div>
          </Button>

          <Button
            onClick={() => handleNavigation('/tools/symptoms')}
            className="w-full justify-start gap-3"
            variant="ghost"
          >
            <Sparkles className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <div className="font-medium">Symptom Guide</div>
              <div className="text-xs text-slate-500">Find peptides for symptoms</div>
            </div>
          </Button>

          {/* Settings Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
              Settings
            </span>
          </div>

          <Button
            onClick={handleThemeToggle}
            className="w-full justify-start gap-3"
            variant="ghost"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
            <div className="text-left">
              <div className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</div>
              <div className="text-xs text-slate-500">Toggle appearance</div>
            </div>
          </Button>

          {/* Account Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
              Account
            </span>
          </div>

          {isLoaded && user ? (
            <>
              <div className="px-2 py-2 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {user.firstName || user.primaryEmailAddress?.emailAddress}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                variant="ghost"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSignIn}
              className="w-full justify-start gap-3"
              variant="ghost"
            >
              <LogIn className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Sign In</div>
                <div className="text-xs text-slate-500">Save your conversations</div>
              </div>
            </Button>
          )}

          {/* Help */}
          <Button
            onClick={() => handleNavigation('/help')}
            className="w-full justify-start gap-3"
            variant="ghost"
          >
            <HelpCircle className="h-5 w-5 text-slate-500" />
            Help & FAQ
          </Button>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 text-center">
        Research platform. Not medical advice.
      </div>
    </div>
  )
}
