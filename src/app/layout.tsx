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
  title: 'Sequence - Your Optimization Sequence',
  description: 'The research engine for human optimization. Research peptides with AI, track your journey, and discover the protocols that work for your biology.',
  keywords: ['peptides', 'research', 'BPC-157', 'TB-500', 'optimization', 'biohacking', 'health', 'science', 'protocols'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sequence',
  },
  openGraph: {
    title: 'Sequence - Your Optimization Sequence',
    description: 'The research engine for human optimization. 1,200+ peer-reviewed papers. Real user data. Evidence-based answers.',
    type: 'website',
    siteName: 'Sequence',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sequence - Your Optimization Sequence',
    description: 'The research engine for human optimization. 1,200+ peer-reviewed papers. Real user data. Evidence-based answers.',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
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
          <meta name="apple-mobile-web-app-title" content="Sequence" />
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" sizes="180x180" href="/api/icon/192" />
          <link rel="apple-touch-icon" sizes="152x152" href="/api/icon/192" />
          <link rel="apple-touch-icon" sizes="120x120" href="/api/icon/192" />
          {/* Splash screens for iOS */}
          <meta name="apple-touch-fullscreen" content="yes" />
          {/* Prevent telephone number detection */}
          <meta name="format-detection" content="telephone=no" />
          {/* Minimal UI hint for browsers */}
          <meta name="browsermode" content="application" />
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
