import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const VOICES = {
  thiha: 'my-MM-ThihaNeural',
  nilar: 'my-MM-NilarNeural',
}

export async function POST(req) {
  try {
    const { text, voice = 'nilar', rate = '+0%' } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'စာသား ထည့်ပါ' }, { status: 400 })
    }

    const cleanText = text.replace(/^-\s*/gm, '').trim()
    if (cleanText.length > 5000) {
      return NextResponse.json(
        { error: 'TTS အတွက် စာလုံး ၅၀၀၀ ထက် မကျော်ရပါ' },
        { status: 400 }
      )
    }

    const voiceId = VOICES[voice] || VOICES.nilar

    // Dynamic import — serverless မှာ bundle မကြီးစေရ
    const { EdgeTTS } = await import('edge-tts-universal')
    const tts = new EdgeTTS()
    const result = await tts.synthesize(cleanText, voiceId, {
      rate,
      pitch: '+0Hz',
      volume: '+0%',
    })

    const audioBuffer = Buffer.from(await result.audio.arrayBuffer())

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: 'အသံဖိုင် ဖန်တီးမရပါ' }, { status: 500 })
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('TTS error:', err)
    return NextResponse.json({ error: 'TTS Error: ' + err.message }, { status: 500 })
  }
}
