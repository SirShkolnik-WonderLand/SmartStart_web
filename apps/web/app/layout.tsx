import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartStart HUB - AliceSolutions Ventures',
  description: 'Professional portfolio management and project oversight platform for venture development',
  keywords: 'portfolio management, venture development, equity tracking, project management',
  authors: [{ name: 'Udi Shkolnik', url: 'https://alicesolutions.com' }],
  creator: 'AliceSolutions',
  publisher: 'AliceSolutions',
  robots: 'index, follow',
  openGraph: {
    title: 'SmartStart HUB - AliceSolutions Ventures',
    description: 'Professional portfolio management and project oversight platform',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartStart HUB - AliceSolutions Ventures',
    description: 'Professional portfolio management and project oversight platform',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
