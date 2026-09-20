'use client'
import { useState, useRef } from 'react'

export default function TTSPlayer({ text, defaultVoice = 'nilar' }) {
  const [voice, setVoice] = useState(defaultVoice)
  const [rate, setRate] = useState('+0%')
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [error, setError] = useState('')
  const audioRef = useRef(null)

  const generateAudio = async () => {
    if (!text || !text.trim()) {
      setError('စာသားမရှိပါ')
      return
    }

    setLoading(true)
    setError('')

    // URL ဟောင်း ကို ရှင်း
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl('')
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, rate }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Error ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      // Auto play
      setTimeout(() => {
        if (audioRef.current) audioRef.current.play()
      }, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadAudio = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `voiceover-${voice}-${Date.now()}.mp3`
    a.click()
  }

  const voices = [
    { id: 'nilar', label: '👩 Nilar (Female)', desc: 'မြန်မာအမျိုးသမီးအသံ' },
    { id: 'thiha', label: '👨 Thiha (Male)', desc: 'မြန်မာအမျိုးသားအသံ' },
  ]

  return (
    <div className="bg-[#0a0e1a] border border-green-500/30 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-green-400 text-xl">🔊</span>
        <h3 className="font-bold text-green-400 flex-1">Text-to-Speech Studio</h3>
        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded font-bold">
          EDGE TTS
        </span>
      </div>

      {/* Voice Selector */}
      <label className="block text-xs text-gray-400 mb-2 font-semibold">
        အသံ ရွေးပါ
      </label>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {voices.map((v) => (
          <button
            key={v.id}
            onClick={() => setVoice(v.id)}
            className={`p-4 rounded-xl border text-left transition ${
              voice === v.id
                ? 'bg-green-500/10 border-green-400/60'
                : 'bg-[#0d1220] border-[#1f2937] hover:border-green-400/30'
            }`}
          >
            <div className={`font-bold ${voice === v.id ? 'text-green-400' : 'text-gray-200'}`}>
              {v.label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{v.desc}</div>
          </button>
        ))}
      </div>

      {/* Speed Control */}
      <label className="block text-xs text-gray-400 mb-2 font-semibold">
        အသံ အမြန်နှုန်း
      </label>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { v: '-25%', l: '🐢 နှေး' },
          { v: '+0%', l: '▶️ ပုံမှန်' },
          { v: '+25%', l: '⚡ မြန်' },
          { v: '+50%', l: '🚀 အရမ်းမြန်' },
        ].map((r) => (
          <button
            key={r.v}
            onClick={() => setRate(r.v)}
            className={`text-xs font-bold px-4 py-2 rounded-lg border transition ${
              rate === r.v
                ? 'bg-green-500/20 border-green-400/60 text-green-400'
                : 'bg-[#0d1220] border-[#1f2937] text-gray-400 hover:text-gray-200'
            }`}
          >
            {r.l}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={generateAudio}
        disabled={loading || !text}
        className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>⏳ အသံ ဖန်တီးနေသည်...</>
        ) : (
          <>🎙️ အသံဖိုင် ဖန်တီးမည်</>
        )}
      </button>

      {error && (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-4 bg-[#0d1220] border border-green-500/30 rounded-xl p-4">
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full"
            style={{ filter: 'invert(0.9) hue-rotate(90deg)' }}
          />
          <button
            onClick={downloadAudio}
            className="w-full mt-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            ⬇️ MP3 ဖိုင် ဒေါင်းလုပ်
          </button>
        </div>
      )}
    </div>
  )
}
