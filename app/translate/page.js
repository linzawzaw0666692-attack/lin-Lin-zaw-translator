'use client'
import { useState, useEffect } from 'react'

const MAX_CHARS = 5000
const DAILY_LIMIT = 5

export default function TranslatePage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sourceLang, setSourceLang] = useState('auto')
  const [error, setError] = useState('')
  const [isDrama, setIsDrama] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [todayCount, setTodayCount] = useState(0)

  // History ကို localStorage မှ load
  useEffect(() => {
    const saved = localStorage.getItem('translateHistory')
    if (saved) setHistory(JSON.parse(saved))

    const today = new Date().toDateString()
    const savedCount = localStorage.getItem('translateCount')
    const savedDate = localStorage.getItem('translateDate')
    if (savedDate === today && savedCount) {
      setTodayCount(parseInt(savedCount))
    } else {
      localStorage.setItem('translateDate', today)
      localStorage.setItem('translateCount', '0')
    }
  }, [])

  const incrementCount = () => {
    const newCount = todayCount + 1
    setTodayCount(newCount)
    localStorage.setItem('translateCount', newCount.toString())
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return setError('ဘာသာပြန်ရန် စာသားထည့်ပါ')
    if (inputText.length > MAX_CHARS) return setError(`စာလုံး ${MAX_CHARS} ထက် မကျော်ရပါ`)

    setLoading(true); setError(''); setOutputText('')

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, sourceLang, isDrama }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ဘာသာပြန်မှု မအောင်မြင်ပါ')

      setOutputText(data.translation)
      incrementCount()

      const newItem = {
        id: Date.now(),
        input: inputText.slice(0, 100),
        output: data.translation,
        time: new Date().toLocaleString('my-MM'),
      }
      const updated = [newItem, ...history].slice(0, 20)
      setHistory(updated)
      localStorage.setItem('translateHistory', JSON.stringify(updated))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setInputText(`The banquet, the kid touched a golden abacus and it instantly rusted and turned black, then he touched his cousin's hair, it fell out in clumps and he aged 50 years in an instant. Scared, his mother stepped back and ordered the guards to take him to the doctor.`)
  }

  const clearAll = () => {
    setInputText(''); setOutputText(''); setError('')
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">

      {/* ===== INPUT CARD ===== */}
      <div className="bg-[#0d1220] border border-[#1f2937] rounded-2xl p-5 mb-5">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-yellow-400 text-xl">📄</span>
            <h2 className="font-bold text-white">Input Source Text:</h2>
          </div>
          <span className="text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full">
            Today: {todayCount}/{DAILY_LIMIT}
          </span>
          <button
            onClick={loadSample}
            className="text-xs font-bold bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg transition"
          >
            Load Sample
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Paste your drama script, English/Chinese lines, or transcript here..."
          rows={9}
          className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-xl px-4 py-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 resize-none text-base leading-relaxed"
        />

        {/* Char Counter */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-1">
          <span>Max {MAX_CHARS.toLocaleString()} characters per translation</span>
          <span className={inputText.length > MAX_CHARS * 0.9 ? 'text-red-400 font-bold' : ''}>
            {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        {/* Drama Toggle */}
        <div className="flex items-center gap-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl px-4 py-3 mt-4">
          <input
            type="checkbox"
            id="drama"
            checked={isDrama}
            onChange={(e) => setIsDrama(e.target.checked)}
            className="w-5 h-5 accent-yellow-400 cursor-pointer"
          />
          <label htmlFor="drama" className="flex-1 cursor-pointer">
            <span className="font-bold text-white text-sm">Is this a Drama / Story Recap?</span>
          </label>
          <span className="text-xs text-gray-500 hidden sm:block">Default original names</span>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="w-full mt-4 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base"
        >
          <span>✨</span>
          {loading ? '⏳ ဘာသာပြန်နေသည်...' : 'Translate to Burmese'}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* ===== OUTPUT CARD ===== */}
      <div className="bg-[#0d1220] border border-[#1f2937] rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-green-400 text-xl">🌿</span>
          <h2 className="font-bold text-white">Translated Voiceover Output:</h2>
        </div>

        {/* Output Box */}
        {outputText ? (
          <div className="bg-[#0a0e1a] border border-green-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#1f2937]">
              <span className="text-sm font-bold text-green-400">✅ ဘာသာပြန်ချက် (မြန်မာ)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(outputText)
                  alert('ကော်ပီ ပြီးပါပြီ!')
                }}
                className="text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg transition"
              >
                📋 ကော်ပီ
              </button>
            </div>
            <p className="text-gray-200 whitespace-pre-wrap leading-loose text-base">
              {outputText}
            </p>
          </div>
        ) : (
          <div className="bg-[#0a0e1a] border-2 border-dashed border-[#1f2937] rounded-xl py-16 text-center">
            <div className="text-5xl text-gray-600 mb-3">文A</div>
            <p className="text-gray-400 text-sm">
              Translated Burmese output will appear here
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Enter text and click Translate
            </p>
          </div>
        )}
      </div>

      {/* ===== HISTORY FLOATING BUTTON ===== */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-3 rounded-full shadow-2xl shadow-yellow-400/30 flex items-center gap-2 z-40"
      >
        <span>🕐</span>
        <span>History</span>
        <span className="bg-black text-yellow-400 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {history.length}
        </span>
      </button>

      {/* ===== HISTORY DRAWER ===== */}
      {showHistory && (
        <>
          <div
            onClick={() => setShowHistory(false)}
            className="fixed inset-0 bg-black/70 z-40"
          />
          <div className="fixed bottom-0 left-0 right-0 md:top-0 md:right-0 md:left-auto md:w-96 bg-[#0d1220] border-t md:border-l border-[#1f2937] rounded-t-2xl md:rounded-none z-50 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0d1220] border-b border-[#1f2937] p-4 flex justify-between items-center">
              <h3 className="font-bold text-yellow-400">🕐 History ({history.length})</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-center text-gray-500 py-10">History မရှိသေးပါ</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInputText(item.input)
                      setOutputText(item.output)
                      setShowHistory(false)
                    }}
                    className="bg-[#0a0e1a] border border-[#1f2937] hover:border-yellow-400/40 rounded-lg p-3 cursor-pointer transition"
                  >
                    <p className="text-xs text-gray-500 mb-1">{item.time}</p>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2">{item.input}...</p>
                    <p className="text-sm text-yellow-400 line-clamp-2">{item.output.slice(0, 80)}...</p>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-[#1f2937]">
                <button
                  onClick={() => {
                    localStorage.removeItem('translateHistory')
                    setHistory([])
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-lg transition"
                >
                  🗑️ History အားလုံး ရှင်းလင်း
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
