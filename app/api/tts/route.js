import { NextResponse } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export const runtime = 'nodejs'
export const maxDuration = 60

// Voice Mapping
const VOICES = {
  thiha: 'my-MM-ThihaNeural',   // 👨 Male
  nilar: 'my-MM-NilarNeural',   // 👩 Female
}

export async function POST(req) {
  try {
    const { text, voice = 'nilar', rate = '+0%', pitch = '+0Hz' } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'စာသား ထည့်ပါ' }, { status: 400 })
    }

    // Edge TTS က တစ်ခါ ၅၀၀၀ လုံးခန့်သာ ကိုင်တွယ်နိုင်
    const cleanText = text.replace(/^-\s*/gm, '').trim()
    if (cleanText.length > 5000) {
      return NextResponse.json(
        { error: 'TTS အတွက် စာလုံး ၅၀၀၀ ထက် မကျော်ရပါ' },
        { status: 400 }
      )
    }

    const voiceId = VOICES[voice] || VOICES.nilar

    // Edge TTS instance
    const tts = new MsEdgeTTS()
    await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

    // Audio stream ကို Buffer အဖြစ် ပြောင်း
    const { audioStream } = tts.toStream(cleanText, {
      rate,
      pitch,
      volume: '+0%',
    })

    const chunks = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    const audioBuffer = Buffer.concat(chunks)

    tts.close()

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: 'အသံဖိုင် ဖန်တီးမရပါ' },
        { status: 500 }
      )
    }

    // MP3 ကို ပြန်ပို့
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
    return NextResponse.json(
      { error: 'TTS Error: ' + err.message },
      { status: 500 }
    )
  }
}
