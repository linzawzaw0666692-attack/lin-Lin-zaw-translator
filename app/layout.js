import './globals.css'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'

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
          <div className="flex-1 md:ml-72">
            <TopNav />
            <main className="p-4 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
