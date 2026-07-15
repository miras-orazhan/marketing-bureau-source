import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Viewport — генерируется на основе настроек сайта.
 * В Next.js 16 themeColor и relatedApplications живут здесь, а не в metadata.
 */
export async function generateViewport(): Promise<Viewport> {
  const s = await getSiteSettings()
  return {
    // Цвет адресной строки в мобильных браузерах (Chrome/Safari) —
    // делает сайт более нативным на телефоне.
    themeColor: s.primaryColor,
    // Корректный масштаб на мобильных
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  }
}

/**
 * Базовые (fallback) мета-данные для всего сайта.
 * Постраничные SEO-метаданные переопределяются в page.tsx через generateMetadata(),
 * потому что Next.js 16 не передаёт searchParams в generateMetadata() для layout.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  const title = s.metaTitle
  const description = s.metaDescription
  const keywords = s.metaKeywords
    ? s.metaKeywords.split(',').map((t) => t.trim()).filter(Boolean)
    : undefined

  return {
    title,
    description,
    keywords,
    authors: s.metaAuthor ? [{ name: s.metaAuthor }] : undefined,
    icons: s.favicon
      ? { icon: s.favicon, shortcut: s.favicon, apple: s.favicon }
      : { icon: "/logo.svg" },
    openGraph: {
      title: s.ogTitle,
      description: s.ogDescription,
      url: s.siteUrl || undefined,
      siteName: s.siteName,
      type: s.ogType as any,
      images: s.ogImage ? [{ url: s.ogImage }] : undefined,
    },
    twitter: {
      card: s.twitterCard as any,
      title: s.twitterTitle,
      description: s.twitterDescription,
      images: s.twitterImage ? [s.twitterImage] : s.ogImage ? [s.ogImage] : undefined,
    },
    robots: {
      index: s.robotsIndex,
      follow: s.robotsIndex,
    },
    metadataBase: s.siteUrl ? new URL(s.siteUrl) : undefined,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="skip-link">
          Перейти к основному контенту
        </a>
        {children}
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
