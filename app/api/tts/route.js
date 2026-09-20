import { NextResponse } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export const runtime = 'nodejs'
export const maxDuration = 60

const VOICES = {
  thiha: 'my-MM-ThihaNeural', // 👨 Male
  nilar: 'my-MM-NilarNeural', // 👩 Female
}

export async function POST(req) {
  try {
    const { text, voice = 'nilar', rate = '+0%', pitch = '+0Hz' } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'စာသား ထည့်ပါ' }, { status: 400 })
    }

    const cleanText = text.replace(/^-\s*/gm, '').trim()
    if (cleanText.length > 3000) {
      return NextResponse.json(
        { error: 'TTS အတွက် စာလုံး ၃၀၀၀ ထက် မကျော်ရပါ' },
        { status: 400 }
      )
    }

    const voiceId = VOICES[voice] || VOICES.nilar

    console.log('🎙️ TTS Start:', { voiceId, length: cleanText.length })

    const tts = new MsEdgeTTS()
    await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

    const { audioStream } = tts.toStream(cleanText, {
      rate,
      pitch,
      volume: '+0%',
    })

    const chunks = []

    // Timeout ထည့် — 30 စက္ကန့်
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TTS timeout (30s)')), 30000)
    )

    const collectPromise = (async () => {
      for await (const chunk of audioStream) {
        chunks.push(chunk)
      }
    })()

    await Promise.race([collectPromise, timeoutPromise])
    tts.close()

    const audioBuffer = Buffer.concat(chunks)

    console.log('✅ TTS Done:', audioBuffer.length, 'bytes')

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
    console.error('❌ TTS error:', err)
    return NextResponse.json({ error: 'TTS Error: ' + err.message }, { status: 500 })
  }
}
