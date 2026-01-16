import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'TuFirma | Firmar PDF Gratis Online',
  description: 'Firma documentos PDF gratis, rápido y 100% privado. Tus archivos nunca salen de tu navegador.',
  openGraph: {
    title: 'TuFirma | Firma PDF Online Gratis',
    description: 'Firma PDF desde cualquier dispositivo, REALMENTE GRATIS',
    url: 'https://tufirma.app',
    siteName: 'TuFirma',
    images: [{
      url: '/logo1.png',
      width: 600,
      height: 600,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TuFirma | Firmar PDF Gratis',
    description: 'Firma PDF desde cualquier dispositivo, REALMENTE GRATIS',
    images: ['/logo1.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
