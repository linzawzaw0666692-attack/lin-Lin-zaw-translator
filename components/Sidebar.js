'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const menuItems = [
    { name: 'Home Page', href: '/', icon: '🏠' },
    { name: 'Courses', href: '/courses', icon: '📚' },
    { name: 'Text to Speech', href: '/tts', icon: '🔊', badge: 'NEW' },
    { name: 'YouTube SRT Download', href: '/srt', icon: '📺', badge: 'TOOL' },
    { name: 'Burmese Translate', href: '/translate', icon: '🌐', badge: 'AI' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1f2937] text-yellow-400 p-3 rounded-lg shadow-lg"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#0d1220] border-r border-[#1f2937] z-50 
          transform transition-transform duration-300 overflow-y-auto
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo + Brand */}
        <div className="p-5 border-b border-[#1f2937]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xl">
              N
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">လင်းလင်းဇော်</h1>
              <p className="text-xs text-gray-500">linlinzaw.com</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="md:hidden ml-auto text-gray-400 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${active
                    ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/40'
                    : 'text-gray-300 hover:bg-[#1f2937]'
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold
                    ${item.badge === 'NEW' ? 'bg-yellow-500 text-black' : ''}
                    ${item.badge === 'TOOL' ? 'bg-red-500/20 text-red-400' : ''}
                    ${item.badge === 'AI' ? 'bg-yellow-500 text-black' : ''}
                  `}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 mt-auto border-t border-[#1f2937]">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] mb-3">
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span className="text-sm">Language</span>
            </div>
            <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded">
              EN
            </span>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400 text-black font-bold">
            <span>⚡</span>
            <span>LinLin</span>
          </button>
        </div>

        {/* Footer Links */}
        <div className="p-4 text-xs text-gray-500 text-center border-t border-[#1f2937]">
          <div className="flex justify-center gap-3 mb-2">
            <a href="#">Privacy</a>
            <span>·</span>
            <a href="#">Terms</a>
            <span>·</span>
            <a href="#">About</a>
            <span>·</span>
            <a href="#">Contact</a>
          </div>
          <p>© 2026 linlinzaw.com</p>
        </div>
      </aside>
    </>
  )
}
