'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { name: '🏠 ပင်မ', href: '/' },
    { name: '📖 Translate Fiction', href: '/translate' },
    { name: 'ℹ️ အကြောင်း', href: '/about' },
  ]

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            လင်းလင်းဇော်
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:bg-white/20 px-4 py-2 rounded-lg transition"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <ul className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block hover:bg-white/20 px-4 py-2 rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  )
}
