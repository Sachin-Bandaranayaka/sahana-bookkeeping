import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sahana Bookkeeping',
  description: 'NGO Bookkeeping System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-100`}>
        <div className="min-h-full">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  )
}
