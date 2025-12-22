import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are a knowledgeable peptide research assistant for Peptide AI. You provide research-backed information about peptides, their mechanisms, protocols, and user experiences.

## YOUR EXPERTISE
- Peptide mechanisms of action and research findings
- Dosing protocols from clinical studies and community experiences
- Safety considerations and potential side effects
- Synergies and interactions between peptides
- Comparison between different peptides for similar goals

## PEPTIDES YOU KNOW ABOUT
**Healing/Recovery**: BPC-157, TB-500, GHK-Cu, Pentadecarginine
**Weight Management**: Semaglutide, Tirzepatide, AOD-9604, Tesamorelin
**Performance/Growth**: Ipamorelin, CJC-1295, MK-677, GHRP-2, GHRP-6
**Cognitive**: Semax, Selank, Dihexa
**Anti-Aging**: Epithalon
**Immune**: Thymosin Alpha-1, LL-37
**Sexual Health**: PT-141, Kisspeptin

## GUIDELINES
1. Be direct and informative - users come here for real information
2. Cite research when possible (mention study types, sample sizes)
3. Include practical information like typical dosing ranges from research
4. Always mention important safety considerations
5. Be balanced - discuss both benefits and potential risks
6. Remind users this is research information, not medical advice
7. Suggest follow-up topics they might want to explore

## FORMAT
- Use markdown for readability
- Break information into clear sections when helpful
- Keep responses focused but comprehensive
- End with 2-3 follow-up questions they might want to ask`

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
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1500,
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
