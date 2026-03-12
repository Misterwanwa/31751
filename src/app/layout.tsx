import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WI Lernplattform – Windows XP Edition',
  description: 'Interaktive Lernplattform für Wirtschaftsinformatik',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
