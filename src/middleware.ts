import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/chat(.*)',  // Chat is public - let users try before signing up
  '/share(.*)', // Shared conversations and stacks are public
  '/api/(.*)',  // API routes handle their own auth
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

const ADMIN_EMAILS = ['vibetradefox@gmail.com']

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Admin route protection
  if (isAdminRoute(request)) {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    try {
      // Fetch user from Clerk to get their email
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const primaryEmail = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId
      )?.emailAddress

      if (!primaryEmail || !ADMIN_EMAILS.includes(primaryEmail)) {
        // Redirect non-admins to home
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      // On error, deny access
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
