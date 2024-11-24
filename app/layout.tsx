// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReBottle',
  description: 'Recycle and earn rewards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Simplified meta tag to avoid display issues */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3B6DA5" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#3B6DA5] antialiased`}>
        <AuthProvider>
          {/* Added `relative` to ensure stacking context */}
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
