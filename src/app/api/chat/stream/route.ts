import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PEPTIDE_AI_MASTER_KEY

export async function POST(request: NextRequest) {
  const { message, messages: history = [], conversation_id } = await request.json()

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!API_URL || !API_KEY) {
    return new Response(JSON.stringify({ error: 'Backend not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const backendResponse = await fetch(`${API_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        message,
        conversation_id,
        history: history.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend streaming error:', backendResponse.status, errorText)
      return new Response(JSON.stringify({ error: 'Backend error' }), {
        status: backendResponse.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Forward the SSE stream
    return new Response(backendResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Streaming error:', error)
    return new Response(JSON.stringify({ error: 'Failed to stream' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
