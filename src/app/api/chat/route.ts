import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PEPTIDE_AI_MASTER_KEY

// Fallback system prompt for when backend is unavailable
const FALLBACK_SYSTEM_PROMPT = `You are a friendly, knowledgeable peptide research guide. Keep responses conversational and concise (2-3 paragraphs max). Ask clarifying questions to understand the user's situation.`

export async function POST(request: Request) {
  try {
    const { message, messages: history = [], conversation_id } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Try backend API first (with RAG)
    if (API_URL && API_KEY) {
      try {
        const backendResponse = await fetch(`${API_URL}/api/v1/chat`, {
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

        if (backendResponse.ok) {
          const data = await backendResponse.json()
          return NextResponse.json({
            response: data.response,
            sources: data.sources || [],
            follow_ups: data.follow_ups || [],
            disclaimers: data.disclaimers || [],
            conversation_id: data.conversation_id,
          })
        }
        console.error('Backend API error:', backendResponse.status, await backendResponse.text())
      } catch (backendError) {
        console.error('Backend API unavailable:', backendError)
      }
    }

    // Fallback to direct OpenAI if backend unavailable
    console.log('Using fallback OpenAI directly')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const chatMessages = [
      { role: 'system' as const, content: FALLBACK_SYSTEM_PROMPT },
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: chatMessages,
      temperature: 0.8,
      max_tokens: 600,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({
      response,
      sources: [],
      follow_ups: [],
      disclaimers: [
        'This information is for research purposes only.',
        'Always consult healthcare professionals before using any peptides.',
      ],
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    )
  }
}
