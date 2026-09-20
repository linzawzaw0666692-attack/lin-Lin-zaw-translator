'use client'
import { useState } from 'react'

export default function TopNav() {
  const [lang, setLang] = useState('EN')

  return (
    <header className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur border-b border-[#1f2937] px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Menu (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button className="md:hidden bg-[#1f2937] text-yellow-400 p-2.5 rounded-lg">
            ☰
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-lg">
            N
          </div>
          <h1 className="font-bold text-yellow-400 text-lg hidden sm:block">
            လင်းလင်းဇော်
          </h1>
        </div>

        {/* Right: Lang + LinLin */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'EN' ? 'MY' : 'EN')}
            className="flex items-center gap-1.5 bg-[#111827] border border-[#1f2937] hover:border-yellow-400/40 px-3 py-2 rounded-lg transition"
          >
            <span>🌐</span>
            <span className="text-yellow-400 font-bold text-sm">{lang}</span>
          </button>
          <button className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg transition">
            <span>⚡</span>
            <span className="text-sm">LinLin</span>
          </button>
        </div>
      </div>
    </header>
  )
}
