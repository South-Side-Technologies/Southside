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
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable} ${alfaSlab.variable} bg-gray-50 text-black flex flex-col min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}