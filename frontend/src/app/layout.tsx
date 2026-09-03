import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DayMark — Visual Year Productivity & Focus Tracker',
  description:
    'A high-performance personal productivity suite featuring a full-year visual calendar heatmap, focus timer, habits tracker, task manager, and daily reviews.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} dark`}>
      <head>
        <meta name="theme-color" content="#090D16" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased font-sans bg-[#090D16] text-slate-100">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
