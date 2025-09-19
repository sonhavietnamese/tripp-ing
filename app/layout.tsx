import '@/styles/globals.css'
import Providers from '@/components/providers'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

const ocFormat = localFont({
  src: '../fonts/oc-format.ttf',
  variable: '--font-oc-format',
})

const ciko = localFont({
  src: '../fonts/ciko.ttf',
  variable: '--font-ciko',
})

export const metadata: Metadata = {
  title: 'Tripp',
  description: 'Help Tripp take back his Nuts from Grub - grab a Fresh Coke for the awesome rewards!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${ciko.variable} ${ocFormat.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
