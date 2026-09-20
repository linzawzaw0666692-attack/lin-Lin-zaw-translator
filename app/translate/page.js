'use client'
import { useState } from 'react'

export default function TranslatePage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sourceLang, setSourceLang] = useState('auto')
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('ဘာသာပြန်ရန် စာသားထည့်ပါ')
      return
    }
    setLoading(true)
    setError('')
    setOutputText('')

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
    alert('ကော်ပီ ပြီးပါပြီ! ✅')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        📖 Translate Fiction
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <label className="block font-semibold mb-2">မူရင်း ဘာသာစကား</label>
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 mb-4"
        >
          <option value="auto">🔍 အလိုအလျောက် ရှာဖွေ</option>
          <option value="en">🇬🇧 English</option>
          <option value="zh">🇨🇳 Chinese (中文)</option>
        </select>

        <label className="block font-semibold mb-2">ဘာသာပြန်လိုသော စာသား</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="ဒီနေရာမှာ English သို့မဟုတ် တရုတ်စာသား ထည့်ပါ..."
          rows={10}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            {loading ? '⏳ ဘာသာပြန်နေသည်...' : '🚀 မြန်မာလို ဘာသာပြန်မည်'}
          </button>
          <button
            onClick={() => { setInputText(''); setOutputText(''); setError('') }}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            🗑️ ရှင်းလင်း
          </button>
        </div>

        {error && (
          <p className="mt-3 text-red-600 font-medium">⚠️ {error}</p>
        )}
      </div>

      {outputText && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-green-700">✅ ဘာသာပြန်ချက် (မြန်မာ)</h2>
            <button
              onClick={copyToClipboard}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              📋 ကော်ပီ
            </button>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {outputText}
          </p>
        </div>
      )}
    </div>
  )
}
