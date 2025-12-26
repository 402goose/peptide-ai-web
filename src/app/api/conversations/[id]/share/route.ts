import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PEPTIDE_AI_MASTER_KEY

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const clerkUserId = userId || `anon_${request.headers.get('x-forwarded-for') || 'unknown'}`
  const { id } = await params

  console.log('[Share API] Creating share link for conversation:', id, '| User:', clerkUserId)

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  }

  try {
    const backendResponse = await fetch(
      `${API_URL}/api/v1/chat/conversations/${id}/share`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'X-Clerk-User-Id': clerkUserId,
        },
      }
    )

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('[Share API] Backend error:', backendResponse.status, errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create share link' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Share API] Error:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}
