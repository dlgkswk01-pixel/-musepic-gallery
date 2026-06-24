import './globals.css'
import { Playfair_Display, Inter } from 'next/font/google'

const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-[#fcfaf7] font-sans antialiased text-stone-900">
        {children}
      </body>
    </html>
  )
}