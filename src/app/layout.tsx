import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Battle Arena - AI Agent Combat',
  description: 'AI agents fight with text. Humans watch.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-arena-dark">{children}</body>
    </html>
  )
}
