import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const { text, sourceLang } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'စာသား ထည့်ပါ' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY မရှိပါ' },
        { status: 500 }
      )
    }

    const langHint =
      sourceLang === 'en'
        ? 'The source text is in English.'
        : sourceLang === 'zh'
        ? 'The source text is in Chinese.'
        : 'Detect the source language (English or Chinese) automatically.'

    const prompt = `You are a professional literary translator. ${langHint}
Translate the following text into natural, fluent Burmese (Myanmar language).
For fiction/novels, keep the tone smooth and readable like a native Myanmar novel.
Only output the Burmese translation — no explanations, no English, no pinyin.

Text to translate:
"""
${text}
"""`

    // ✅ Gemini 3.6 Flash REST API ကို တိုက်ရိုက် ခေါ်ခြင်း
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error('Gemini API error:', errData)
      return NextResponse.json(
        {
          error:
            errData?.error?.message ||
            `Gemini API error: ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Response ထဲက text ကို ဆွဲထုတ်
    const translation =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!translation) {
      return NextResponse.json(
        { error: 'ဘာသာပြန်ချက် မရရှိပါ' },
        { status: 500 }
      )
    }

    return NextResponse.json({ translation })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json(
      { error: 'ဘာသာပြန်မှု အမှားအယွင်း: ' + err.message },
      { status: 500 }
    )
  }
}
