import { GoogleGenerativeAI } from '@google/generative-ai'
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

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
If the text contains dialogue, keep it natural in Burmese style.

Text to translate:
"""
${text}
"""`

    const result = await model.generateContent(prompt)
    const translation = result.response.text()

    return NextResponse.json({ translation })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json(
      { error: 'ဘာသာပြန်မှု အမှားအယွင်း: ' + err.message },
      { status: 500 }
    )
  }
}
