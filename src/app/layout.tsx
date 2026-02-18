import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '搶旗仔 - Capture the Flag',
  description: 'A Minecraft-style Capture the Flag game. Red vs Blue, 7v7. Carry flags to the mountain top to score!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="overflow-hidden">{children}</body>
    </html>
  )
}
