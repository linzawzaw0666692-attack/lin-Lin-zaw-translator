import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const { text, sourceLang, isDrama, femaleLead, maleLead } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'စာသား ထည့်ပါ' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY မရှိပါ' }, { status: 500 })
    }

    const langHint =
      sourceLang === 'en' ? 'The source text is in English.'
      : sourceLang === 'zh' ? 'The source text is in Chinese.'
      : 'Detect the source language automatically (English, Chinese, Spanish, or any language).'

    let dramaHint = ''
    if (isDrama) {
      dramaHint = `
This is a DRAMA / STORY RECAP voiceover.
IMPORTANT NAME RULES:
- Female Lead (မင်းသမီး) name should be rendered as: "${femaleLead || 'မင်းသမီး'}"
- Male Lead (မင်းသား) name should be rendered as: "${maleLead || 'မင်းသား'}"
- If original text uses generic terms like "Female lead" or "Male lead", replace with above names.
- Keep character names consistent throughout.

OUTPUT FORMAT REQUIREMENTS:
- Each scene line, dialogue, or paragraph must start with "- " (dash and space).
- Use natural Burmese voiceover recap style.
- Keep scene markers like [music], [applause] in Burmese transliteration within the line.
- Example:
  - မင်းသမီး: ဒီဇာတ်လမ်းက စိတ်ဝင်စားစရာပဲ။
  - မင်းသား: ဟုတ်တယ်၊ ငါလည်း သဘောတူတယ်။
`
    } else {
      dramaHint = `
OUTPUT FORMAT:
- Each paragraph or line must start with "- " (dash and space).
- Keep the tone natural and smooth like a native Myanmar novel.
`
    }

    const prompt = `You are a professional literary translator. ${langHint}
Translate the following text into natural, fluent Burmese (Myanmar language).
${dramaHint}
Only output the Burmese translation. Do NOT include the original language.
Do NOT include explanations or notes.

Text to translate:
"""
${text}
"""`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errData?.error?.message || `Gemini API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    let translation = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!translation) {
      return NextResponse.json({ error: 'ဘာသာပြန်ချက် မရရှိပါ' }, { status: 500 })
    }

    // သေချာအောင် line တစ်ခုချင်းစီ "- " prefix ဖြည့်
    translation = translation
      .split('\n')
      .map((line) => {
        const t = line.trim()
        if (!t) return ''
        return t.startsWith('-') ? t : `- ${t}`
      })
      .filter((l) => l !== '')
      .join('\n')

    return NextResponse.json({ translation })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: 'Error: ' + err.message }, { status: 500 })
  }
}
