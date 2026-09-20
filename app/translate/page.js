'use client'
import { useState } from 'react'

export default function TranslatePage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sourceLang, setSourceLang] = useState('auto')
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    if (!inputText.trim()) return setError('ဘာသာပြန်ရန် စာသားထည့်ပါ')
    setLoading(true); setError(''); setOutputText('')

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, sourceLang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ဘာသာပြန်မှု မအောင်မြင်ပါ')
      setOutputText(data.translation)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        📖 Burmese Translate <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded ml-2">AI</span>
      </h1>

      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 mb-6">
        <label className="block text-sm text-gray-400 mb-2">မူရင်း ဘာသာစကား</label>
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="w-full md:w-64 bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-4 py-2 mb-5 text-gray-200"
        >
          <option value="auto">🔍 အလိုအလျောက် ရှာဖွေ</option>
          <option value="en">🇬🇧 English</option>
          <option value="zh">🇨🇳 Chinese</option>
        </select>

        <label className="block text-sm text-gray-400 mb-2">ဘာသာပြန်လိုသော စာသား</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="ဒီနေရာမှာ English သို့မဟုတ် တရုတ်စာသား ထည့်ပါ..."
          rows={10}
          className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-yellow-400"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black font-bold px-6 py-3 rounded-lg transition"
          >
            {loading ? '⏳ ဘာသာပြန်နေသည်...' : '🚀 မြန်မာလို ဘာသာပြန်မည်'}
          </button>
          <button
            onClick={() => { setInputText(''); setOutputText(''); setError('') }}
            className="bg-[#1f2937] hover:bg-[#374151] text-gray-200 font-bold px-6 py-3 rounded-lg transition"
          >
            🗑️ ရှင်းလင်း
          </button>
        </div>

        {error && <p className="mt-3 text-red-400 font-medium">⚠️ {error}</p>}
      </div>

      {outputText && (
        <div className="bg-[#111827] border-l-4 border-yellow-400 rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-yellow-400">✅ ဘာသာပြန်ချက် (မြန်မာ)</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(outputText); alert('ကော်ပီ ပြီးပါပြီ!') }}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg text-sm font-bold"
            >
              📋 ကော်ပီ
            </button>
          </div>
          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{outputText}</p>
        </div>
      )}
    </div>
  )
}
