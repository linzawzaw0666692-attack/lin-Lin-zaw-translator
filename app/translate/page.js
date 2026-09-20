'use client'
import { useState, useEffect } from 'react'

const MAX_CHARS = 5000
const DAILY_LIMIT = 5

const SAMPLE_TEXT = `[music]
Scene 1: Office buildingThe CEO enters the room and looks at the boss.
Boss: We must expand our company drama production immediately.
Female lead: I disagree, we should focus on the quality first.
Male lead: She is right, let's take our time.
[applause]`

export default function TranslatePage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sourceLang, setSourceLang] = useState('auto')
  const [error, setError] = useState('')
  const [isDrama, setIsDrama] = useState(false)
  const [femaleLead, setFemaleLead] = useState('မင်းသမီး')
  const [maleLead, setMaleLead] = useState('မင်းသား')
  const [history, setHistory] = useState([])
  const [todayCount, setTodayCount] = useState(0)

  // Load from localStorage
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
        body: JSON.stringify({
          text: inputText,
          sourceLang,
          isDrama,
          femaleLead: isDrama ? femaleLead : '',
          maleLead: isDrama ? maleLead : '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ဘာသာပြန်မှု မအောင်မြင်ပါ')

      setOutputText(data.translation)
      incrementCount()

      const newItem = {
        id: Date.now(),
        input: inputText,
        output: data.translation,
        chars: inputText.length,
        time: new Date().toLocaleString('en-GB', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }).replace(',', ''),
      }
      const updated = [newItem, ...history].slice(0, 30)
      setHistory(updated)
      localStorage.setItem('translateHistory', JSON.stringify(updated))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => setInputText(SAMPLE_TEXT)
  const clearAll = () => { setInputText(''); setOutputText(''); setError('') }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    alert('ကော်ပီ ပြီးပါပြီ! ✅')
  }

  const downloadTxt = () => {
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translation-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const recallItem = (item) => {
    setInputText(item.input)
    setOutputText(item.output)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteHistoryItem = (id) => {
    const updated = history.filter((h) => h.id !== id)
    setHistory(updated)
    localStorage.setItem('translateHistory', JSON.stringify(updated))
  }

  const clearHistory = () => {
    if (!confirm('History အားလုံး ဖျက်မှာ သေချာလား?')) return
    setHistory([])
    localStorage.removeItem('translateHistory')
  }

  // Output ကို line-by-line ခွဲပြီး "- " prefix
  const formatOutput = (text) => {
    if (!text) return []
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // ရှိပြီးသား "- " ကို duplicate မလုပ်ရ
        return line.startsWith('-') ? line : `- ${line}`
      })
  }

  return (
    <div className="max-w-3xl mx-auto pb-40">

      {/* ===== INPUT CARD ===== */}
      <div className="bg-[#0d1220] border border-[#1f2937] rounded-2xl p-5 mb-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-yellow-400 text-xl">📄</span>
          <h2 className="font-bold text-white leading-tight">
            Input Source<br />Text:
          </h2>
          <span className="text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-full whitespace-nowrap">
            Today:<br className="sm:hidden" /> {todayCount}/{DAILY_LIMIT}
          </span>
          <button
            onClick={loadSample}
            className="text-xs font-bold bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-3 py-2 rounded-lg transition leading-tight"
          >
            Load<br className="sm:hidden" /> Sample
          </button>
          <button
            onClick={clearAll}
            className="text-xs font-bold text-gray-400 hover:text-gray-200 px-3 py-2 transition ml-auto"
          >
            Clear
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Paste your drama script, English/Chinese lines, or transcript here..."
          rows={9}
          className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-2xl px-4 py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 resize-none text-base leading-relaxed"
        />

        {/* Char Counter */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-1">
          <span>Max {MAX_CHARS.toLocaleString()} characters per translation</span>
          <span className={inputText.length > MAX_CHARS * 0.9 ? 'text-red-400 font-bold' : ''}>
            {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        {/* ===== DRAMA TOGGLE + LEAD NAMES ===== */}
        <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-2xl p-4 mt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="drama"
              checked={isDrama}
              onChange={(e) => setIsDrama(e.target.checked)}
              className="w-5 h-5 accent-yellow-400 cursor-pointer rounded"
            />
            <span className="text-yellow-400 text-lg">👤</span>
            <label htmlFor="drama" className="flex-1 cursor-pointer font-bold text-white">
              Is this a Drama / Story Recap?
            </label>
            <span className="text-xs text-gray-500 hidden sm:block">
              {isDrama ? 'Lead names enabled' : 'Default original names'}
            </span>
          </div>

          {isDrama && (
            <div className="mt-4 pt-4 border-t border-[#1f2937] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold">
                  Female Lead
                </label>
                <input
                  type="text"
                  value={femaleLead}
                  onChange={(e) => setFemaleLead(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[#1f2937] rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-yellow-400/50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold">
                  Male Lead
                </label>
                <input
                  type="text"
                  value={maleLead}
                  onChange={(e) => setMaleLead(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[#1f2937] rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-yellow-400/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-full transition flex items-center justify-center gap-2 text-base shadow-lg shadow-yellow-400/20"
        >
          <span className="text-xl">✨</span>
          {loading ? '⏳ ဘာသာပြန်နေသည်...' : 'Translate to Burmese'}
        </button>

        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* ===== OUTPUT CARD ===== */}
      <div className="bg-[#0d1220] border border-[#1f2937] rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-green-400 text-xl">🌿</span>
          <h2 className="font-bold text-white flex-1">Translated Voiceover Output:</h2>
          {outputText && (
            <div className="flex gap-2">
              <button
                onClick={() => copyText(outputText)}
                className="bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
              >
                📋 Copy
              </button>
              <button
                onClick={downloadTxt}
                className="bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
              >
                ⬇️ TXT
              </button>
            </div>
          )}
        </div>

        {outputText ? (
          <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-2xl p-5">
            <div className="space-y-2 text-green-400 leading-loose text-base">
              {formatOutput(outputText).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0e1a] border-2 border-dashed border-[#1f2937] rounded-2xl py-16 text-center">
            <div className="text-5xl text-gray-600 mb-3">文A</div>
            <p className="text-gray-400 text-sm">Translated Burmese output will appear here</p>
            <p className="text-gray-600 text-xs mt-2">Enter text and click Translate</p>
          </div>
        )}

        {/* TTS Studio Button */}
        <button
          onClick={() => alert('TTS Studio ကို မကြာမီ ထည့်ပါမယ်!')}
          disabled={!outputText}
          className="w-full mt-4 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed border border-green-500/40 text-green-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition"
        >
          <span className="text-xl">🔊</span>
          Send to Text-to-Speech Studio to generate audio
        </button>
      </div>

      {/* ===== HISTORY CARD (Full Width) ===== */}
      <div className="bg-[#0d1220] border border-[#1f2937] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400 text-xl">🕐</span>
          <h2 className="font-bold text-white flex-1">
            Recent Translation History
            <span className="text-gray-500 ml-2">({history.length})</span>
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-gray-400 hover:text-red-400 text-xs font-bold flex items-center gap-1.5"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            History မရှိသေးပါ
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-[#0a0e1a] border border-[#1f2937] rounded-xl p-4"
              >
                {/* Date + Char Count */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>{item.time}</span>
                  <span>{item.chars} chars</span>
                </div>

                {/* Preview */}
                <div className="text-sm text-gray-300 leading-relaxed mb-3 line-clamp-3">
                  {item.output.slice(0, 200)}...
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end border-t border-[#1f2937] pt-3">
                  <button
                    onClick={() => recallItem(item)}
                    className="text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-1.5 rounded-lg"
                  >
                    Recall
                  </button>
                  <button
                    onClick={() => copyText(item.output)}
                    className="text-xs font-bold text-gray-300 hover:text-white px-4 py-1.5"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => alert('TTS Studio ကို မကြာမီ ထည့်ပါမယ်!')}
                    className="text-xs font-bold text-green-400 hover:text-green-300 px-4 py-1.5"
                  >
                    TTS
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
