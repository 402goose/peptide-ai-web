import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'
import './globals.css'

// Force dynamic rendering to avoid Clerk issues during build
export const dynamic = 'force-dynamic'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Peptide AI - Research Assistant',
  description: 'Research-grade peptide knowledge platform powered by RAG. Explore peer-reviewed research and real user experiences.',
  keywords: ['peptides', 'research', 'BPC-157', 'TB-500', 'health', 'science'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Peptide AI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      afterSignInUrl="/chat"
      afterSignUpUrl="/chat"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* iOS PWA support */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Peptide AI" />
          <link rel="apple-touch-icon" sizes="180x180" href="/api/icon/192" />
          <link rel="apple-touch-icon" sizes="152x152" href="/api/icon/192" />
          <link rel="apple-touch-icon" sizes="120x120" href="/api/icon/192" />
          {/* Splash screens for iOS */}
          <meta name="apple-touch-fullscreen" content="yes" />
          {/* Prevent telephone number detection */}
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
