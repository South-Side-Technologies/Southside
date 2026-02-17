import React from 'react'
import type { Metadata } from 'next'
import { Inter, Playfair_Display, Alfa_Slab_One } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const alfaSlab = Alfa_Slab_One({ subsets: ['latin'], weight: '400', variable: '--font-alfa' })

export const metadata: Metadata = {
  title: 'South Side Technologies',
  description: 'Tech company offering Cloud Infrastructure, Cost Optimization, Business Automation, AI Services, and Web Development.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const darkMode = localStorage.getItem('darkMode');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const shouldBeDark = darkMode ? darkMode === 'true' : prefersDark;
              if (shouldBeDark) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${playfair.variable} ${alfaSlab.variable} bg-gray-50 dark:bg-gray-900 text-black dark:text-white flex flex-col min-h-screen transition-colors`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}