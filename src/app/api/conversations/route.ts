import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PEPTIDE_AI_MASTER_KEY

export async function GET(request: NextRequest) {
  // Get Clerk user ID for per-user conversation isolation
  const { userId } = await auth()
  const clerkUserId = userId || `anon_${request.headers.get('x-forwarded-for') || 'unknown'}`

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '20'
  const offset = searchParams.get('offset') || '0'

  try {
    const backendResponse = await fetch(
      `${API_URL}/api/v1/chat/conversations?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'X-Clerk-User-Id': clerkUserId,
        },
      }
    )

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error:', backendResponse.status, errorText)
      return NextResponse.json({ error: 'Backend error' }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
