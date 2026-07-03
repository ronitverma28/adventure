import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'HimYatraa | Premium Himalayan Treks',
    template: '%s | HimYatraa',
  },
  description:
    'Discover India\'s most breathtaking treks. Expert guides, seamless booking, and unforgettable experiences in the Himalayas and beyond.',
  keywords: ['valley of flower','hemkund','uttrakhand trips','himyatra','himyatraa','trekking', 'hiking', 'Himalayas', 'adventure travel', 'India treks', ],
  authors: [{ name: 'HimYatraa Platform' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.himyatraa.com',
    siteName: 'HimYatraa',
    images: [{ url: '/images/app-logo.png', width: 1200, height: 630 }],
  },
  icons: {
    icon: "/images/app-logo.png",
    shortcut: "/images/app-logo.png",
    apple: "/images/app-logo.png",
  },
  twitter: {
    card: 'summary_large_image',
    site: '@himyatraa',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
