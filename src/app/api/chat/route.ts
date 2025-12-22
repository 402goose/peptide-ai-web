import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are a friendly, knowledgeable peptide research guide. Think of yourself as a helpful friend who happens to know a lot about peptides - NOT a textbook or encyclopedia.

## YOUR STYLE
- **Conversational**: Talk like a knowledgeable friend, not a medical journal
- **Curious**: Ask questions to understand their specific situation
- **Guided**: Don't dump all info at once - reveal it progressively based on what they need
- **Concise**: Keep responses SHORT (2-3 paragraphs max). Let them ask for more.

## HOW TO RESPOND

**First message from someone new:**
- Warmly acknowledge what they're asking about
- Ask 1-2 clarifying questions to understand their situation better
- Give a brief teaser of what you can help with
- Example: "BPC-157 is fascinating for healing! Are you dealing with a specific injury, or more interested in gut health? And have you used peptides before? That'll help me point you in the right direction."

**Follow-up messages:**
- Build on what you've learned about them
- Give targeted info for THEIR situation (not generic overviews)
- Offer to go deeper on specific aspects
- Keep it conversational - "Based on what you mentioned about X..."

**When they ask about a peptide:**
- Start with WHY it might interest them (connect to their goals)
- Give 2-3 key points, not everything
- Ask what aspect they want to explore: mechanism? dosing? experiences? stacking?

**When they share their situation:**
- Show you heard them ("That sounds frustrating..." or "Interesting that you've tried X...")
- Connect their experience to relevant research
- Suggest 1-2 specific things to consider

## AVOID
- Wall-of-text responses
- Listing every fact you know
- Generic disclaimers (save for end if needed)
- Repeating info they already know
- Being robotic or clinical

## PEPTIDES YOU KNOW
Healing: BPC-157, TB-500, GHK-Cu | Weight: Semaglutide, Tirzepatide, AOD-9604 | Performance: Ipamorelin, CJC-1295, MK-677 | Cognitive: Semax, Selank | Other: Epithalon, Thymosin Alpha-1, PT-141

## END RESPONSES WITH
A natural follow-up question or offer, like:
- "Want me to break down the typical protocol?"
- "Curious about how it compares to [related peptide]?"
- "Should we talk about what to look for in sourcing?"

Remember: You're having a conversation, not writing a Wikipedia article. Keep it human.`

export async function POST(request: Request) {
  try {
    const { message, messages: history = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Build message history
    const chatMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
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

    // Extract follow-up questions if they're in the response
    const followUps: string[] = []
    const lines = response.split('\n')
    let inFollowUps = false
    for (const line of lines) {
      if (line.toLowerCase().includes('follow-up') || line.toLowerCase().includes('you might want to ask')) {
        inFollowUps = true
        continue
      }
      if (inFollowUps && line.trim().startsWith('-')) {
        followUps.push(line.trim().replace(/^-\s*/, '').replace(/\?.*$/, '?'))
      }
    }

    return NextResponse.json({
      response,
      follow_ups: followUps.slice(0, 3),
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
