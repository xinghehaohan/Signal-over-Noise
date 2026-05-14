import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Signal over Noise',
  description: 'Discord Intel & video triage for macro, finance & geopolitics.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
