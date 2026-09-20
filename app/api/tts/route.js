import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// Voice Mapping
const VOICES = {
  thiha: 'my-MM-ThihaNeural', // 👨 Male
  nilar: 'my-MM-NilarNeural', // 👩 Female
}

// ⚠️ Edge TTS က Trusted Client Token လိုတယ်
// ဒါက Microsoft ရဲ့ public token (အများသုံး)
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const CHROMIUM_FULL_VERSION = '130.0.2849.68'
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`

/**
 * Sec-MS-GEC token ဖန်တီး
 * (Microsoft က request ရဲ့ timestamp ကို verify လုပ်တယ်)
 */
function generateSecMsGec() {
  // Windows File Time epoch (1601-01-01)
  const ticks = BigInt(Date.now()) * 10000n + 116444736000000000n
  // 5 မိနစ်စာ round
  const roundedTicks = ticks - (ticks % 3000000000n)
  const str = roundedTicks.toString() + TRUSTED_CLIENT_TOKEN

  // SHA-256 hash
  const crypto = require('crypto')
  const hash = crypto.createHash('sha256').update(str, 'ascii').digest('hex').toUpperCase()
  return hash
}

export async function POST(req) {
  try {
    const { text, voice = 'nilar', rate = '+0%', pitch = '+0Hz' } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'စာသား ထည့်ပါ' }, { status: 400 })
    }

    // Line အစ "- " ဖျက်
    const cleanText = text.replace(/^-\s*/gm, '').trim()

    if (cleanText.length > 5000) {
      return NextResponse.json(
        { error: 'TTS အတွက် စာလုံး ၅၀၀၀ ထက် မကျော်ရပါ' },
        { status: 400 }
      )
    }

    const voiceId = VOICES[voice] || VOICES.nilar

    // Escape XML
    const escapeXml = (s) =>
      s.replace(/[<>&'"]/g, (c) => {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
      })

    // SSML အသစ်
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='my-MM'>
  <voice name='${voiceId}'>
    <prosody rate='${rate}' pitch='${pitch}' volume='+0%'>
      ${escapeXml(cleanText)}
    </prosody>
  </voice>
</speak>`

    // Sec-MS-GEC token
    const secMsGec = generateSecMsGec()

    // Edge TTS WebSocket URL
    const wsUrl =
      `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
      `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
      `&Sec-MS-GEC=${secMsGec}` +
      `&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}` +
      `&ConnectionId=${crypto.randomUUID().replace(/-/g, '')}`

    // ─────────────────────────────────────────
    // Node.js WebSocket ဖြင့် ချိတ်ဆက်
    // ─────────────────────────────────────────
    const WebSocket = require('ws')

    const audioChunks = await new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl, {
        headers: {
          'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_FULL_VERSION.split('.')[0]}.0.0.0 Safari/537.36 Edg/${CHROMIUM_FULL_VERSION.split('.')[0]}.0.0.0`,
        },
      })

      const chunks = []
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('TTS timeout (30s)'))
      }, 30000)

      ws.on('open', () => {
        const timestamp = new Date().toISOString()

        // 1) Speech config
        const speechConfigMsg =
          `X-Timestamp:${timestamp}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: {
                    sentenceBoundaryEnabled: 'false',
                    wordBoundaryEnabled: 'false',
                  },
                  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
                },
              },
            },
          })

        ws.send(speechConfigMsg)

        // 2) SSML
        const ssmlMsg =
          `X-RequestId:${crypto.randomUUID().replace(/-/g, '')}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${timestamp}Z\r\n` +
          `Path:ssml\r\n\r\n` +
          ssml

        ws.send(ssmlMsg)
      })

      ws.on('message', (data) => {
        // Binary frames — ပထမ 2 bytes header + audio
        if (Buffer.isBuffer(data)) {
          // Path: audio — audio data
          const headerLength = data.readUInt16BE(0)
          const header = data.slice(2, 2 + headerLength).toString()
          if (header.includes('Path:audio')) {
            chunks.push(data.slice(2 + headerLength))
          }
        } else {
          // Text frames — control
          const msg = data.toString()
          if (msg.includes('Path:turn.end')) {
            clearTimeout(timeout)
            ws.close()
            resolve(chunks)
          }
        }
      })

      ws.on('error', (err) => {
        clearTimeout(timeout)
        reject(new Error('WebSocket: ' + err.message))
      })

      ws.on('close', () => {
        clearTimeout(timeout)
        if (chunks.length > 0) resolve(chunks)
      })
    })

    if (!audioChunks || audioChunks.length === 0) {
      return NextResponse.json({ error: 'အသံဖိုင် ဖန်တီးမရပါ' }, { status: 500 })
    }

    const audioBuffer = Buffer.concat(audioChunks)

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
