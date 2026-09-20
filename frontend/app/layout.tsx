import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { StoreProvider } from '@/components/store/store-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'RR GROUP Store — Digital Technology & Business Solutions',
    template: '%s | RR GROUP Store',
  },
  description:
    'Shop premium software licenses, website templates, business hardware and marketing tools from RR GROUP — building digital solutions that drive business growth.',
  generator: 'v0.app',
  openGraph: {
    title: 'RR GROUP Store',
    description: 'Premium digital products, software and business hardware from RR GROUP.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/rrlogo.jpeg',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <StoreProvider>{children}</StoreProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
