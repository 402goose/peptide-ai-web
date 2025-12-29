import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PEPTIDE_AI_MASTER_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!API_URL) {
      console.error('API_URL not configured')
      return NextResponse.json(
        { detail: 'Email service not configured' },
        { status: 503 }
      )
    }

    const response = await fetch(`${API_URL}/api/v1/email/journey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend email error:', response.status, errorText)

      // Try to parse as JSON for a proper error message
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(errorJson, { status: response.status })
      } catch {
        return NextResponse.json(
          { detail: 'Failed to send email' },
          { status: response.status }
        )
      }
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
