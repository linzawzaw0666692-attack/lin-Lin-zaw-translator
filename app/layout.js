import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'လင်းလင်းဇော် - Translate Fiction',
  description: 'English & Chinese to Myanmar Translation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="my">
      <body className="bg-[#0a0e1a] text-gray-200 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-72 p-6 md:p-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
