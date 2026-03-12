// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { Ubuntu } from 'next/font/google';
import { Providers } from './providers'; // Import the providers
import "./globals.css";

// Import your fonts
import { Lobster_Two } from "next/font/google";
import { Josefin_Sans } from "next/font/google";
import { Hammersmith_One } from "next/font/google";
import { Lalezar } from "next/font/google";

export const lalezar = Lalezar({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-lalezar",
});

export const hammersmithOne = Hammersmith_One({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-hammersmith-one",
});

export const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: "normal",
  variable: "--font-josefin-sans",
});

export const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-ubuntu",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kofferacoffeeexport.com"),
  alternates: {
  canonical: "/",
},
  title: {
    default: "Koffera Coffee Export",
    template: "%s | Koffera Coffee",
  },
  description: "Koffera Coffee is a premium Ethiopian coffee exporter delivering high-quality Arabica beans worldwide with sustainability and ethical sourcing.",
  applicationName: "Koffera Coffee",
  keywords: [
    "Ethiopian coffee beans",
    "Yirgacheffe coffee export",
    "Sidamo Arabica coffee",
    "fair trade Ethiopian coffee",
    "bulk coffee supplier",
    "Ethiopian coffee",
    "coffee export Ethiopia",
    "Arabica coffee",
    "coffee supplier",
    "Koffera Coffee",
    "KoketGifty Export",
    "coffee exporter Africa",
  ],
  authors: [{ name: "Koffera Coffee" }],
  creator: "Koffera Coffee",
  openGraph: {
    title: "Koffera Coffee | Premium Ethiopian Coffee Exporter",
    description: "Exporting premium Ethiopian Arabica coffee with sustainability and integrity.",
    url: "https://www.kofferacoffeeexport.com",
    siteName: "Koffera Coffee",
    images: [
      {
        url: "https://www.kofferacoffeeexport.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Koffera Coffee Ethiopian Export",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Koffera Coffee",
    description: "Premium Ethiopian coffee exporter delivering quality Arabica beans globally.",
    images: ["https://www.kofferacoffeeexport.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8B4513',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="caramellatte">
      <body className={`${josefinSans.className} ${ubuntu.variable} antialiased`}>
        <Providers> {/* Wrap everything with Providers */}
          <NavBar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}