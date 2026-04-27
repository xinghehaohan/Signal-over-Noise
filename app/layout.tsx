import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Signal over Noise — Video Digest',
  description: 'Personal video triage tool for macro, finance & geopolitics content.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
