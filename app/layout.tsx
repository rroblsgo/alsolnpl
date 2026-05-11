import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AlsolNPL · Gestión de activos NPL',
    template: '%s · AlsolNPL',
  },
  description:
    'Plataforma de gestión de Non-Performing Loans (NPL) e inmuebles en proceso de ejecución hipotecaria. Alsol Inmobiliaria.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://alsolnpl.eu'
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
