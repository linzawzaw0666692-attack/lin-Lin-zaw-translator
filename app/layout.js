import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'လင်းလင်းဇော် - Translate Fiction',
  description: 'English & Chinese to Myanmar Translation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="my">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
