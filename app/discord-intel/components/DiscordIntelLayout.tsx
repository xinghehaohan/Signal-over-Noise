import React from 'react'
import { CSS } from './css'

interface DiscordIntelLayoutProps {
  sidebar: React.ReactNode
  main: React.ReactNode
}

export function DiscordIntelLayout({ sidebar, main }: DiscordIntelLayoutProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="dc-layout">
        {sidebar}
        {main}
      </div>
    </>
  )
}
