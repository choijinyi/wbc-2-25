import type {Metadata} from 'next';
import {Inter, Libre_Baskerville} from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WBC Style Bible Commentary',
  description: 'Analyze Bible texts in the style of the Word Biblical Commentary (WBC).',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body className="font-sans antialiased bg-stone-50 text-stone-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
