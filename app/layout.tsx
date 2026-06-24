import './globals.css'
import { Playfair_Display, Inter } from 'next/font/google'

// 폰트 설정 (Playfair Display는 세리프, Inter는 산세리프)
const serif = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  display: 'swap',
})

const sans = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${serif.variable} ${sans.variable}`}>
      {/* 폰트 변수를 바디에 적용 */}
      <body className="font-sans antialiased bg-[#fcfaf7] text-stone-900">
        {children}
      </body>
    </html>
  )
}