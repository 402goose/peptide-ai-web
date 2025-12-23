import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PEPTIDE_AI_MASTER_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!API_URL || !API_KEY) {
      console.error('API configuration missing')
      return NextResponse.json(
        { error: 'API not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${API_URL}/api/v1/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend feedback error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { error: 'API not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')

    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    if (priority) params.set('priority', priority)

    const response = await fetch(`${API_URL}/api/v1/feedback?${params}`, {
      headers: {
        'X-API-Key': API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
