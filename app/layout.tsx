import './globals.css'
import type { ReactNode } from 'react'
export const metadata = { title: 'MusePic Gallery', description: 'Photo Exhibition' }
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>
}