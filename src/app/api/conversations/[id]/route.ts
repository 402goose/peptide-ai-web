import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PEPTIDE_AI_MASTER_KEY

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const clerkUserId = userId || `anon_${request.headers.get('x-forwarded-for') || 'unknown'}`
  const { id } = await params

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  }

  try {
    const backendResponse = await fetch(
      `${API_URL}/api/v1/chat/conversations/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'X-Clerk-User-Id': clerkUserId,
        },
      }
    )

    if (!backendResponse.ok) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const clerkUserId = userId || `anon_${request.headers.get('x-forwarded-for') || 'unknown'}`
  const { id } = await params

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  }

  try {
    const backendResponse = await fetch(
      `${API_URL}/api/v1/chat/conversations/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'X-Clerk-User-Id': clerkUserId,
        },
      }
    )

    if (!backendResponse.ok) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: backendResponse.status })
    }

    return NextResponse.json({ status: 'deleted' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const clerkUserId = userId || `anon_${request.headers.get('x-forwarded-for') || 'unknown'}`
  const { id } = await params
  const body = await request.json()

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  }

  try {
    const backendResponse = await fetch(
      `${API_URL}/api/v1/chat/conversations/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'X-Clerk-User-Id': clerkUserId,
        },
        body: JSON.stringify(body),
      }
    )

    if (!backendResponse.ok) {
      return NextResponse.json({ error: 'Failed to update' }, { status: backendResponse.status })
    }

    return NextResponse.json({ status: 'updated' })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}
