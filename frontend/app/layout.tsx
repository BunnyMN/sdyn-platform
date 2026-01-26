import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'СДЗН - Социал Демократ Залуучуудын Нэгдэл',
  description: 'Социал Демократ Залуучуудын Нэгдлийн гишүүнчлэлийн систем',
  keywords: ['СДЗН', 'Социал Демократ', 'Залуучууд', 'Монгол'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
