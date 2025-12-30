'use client'

import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { UpdateToast } from '@/components/pwa/UpdateToast'
import { PWANavigationHandler } from '@/components/pwa/PWANavigationHandler'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <FeedbackProvider>
          <ToastProvider>
            <PWANavigationHandler />
            {children}
            <UpdateToast />
          </ToastProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
