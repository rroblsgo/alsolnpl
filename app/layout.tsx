import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({
  // variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meeti - Next',
  description: 'Proyecto Meeti-next16 con Next.js y Drizzle ORM',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
