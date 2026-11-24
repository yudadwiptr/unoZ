import type { Metadata, Viewport } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./skins.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  applicationName: "unoZ",
  authors: [{ name: "Yuma Studio", url: "https://yumastudio.digital/" }],
  creator: "Yuma Studio",
  publisher: "Yuma Studio",
  title: {
    default: "unoZ — Main Kartu Mabar Seru Online & Bot!",
    template: "%s | unoZ",
  },
  description:
    "Main kartu multiplayer mobile-first paling seru! Mode Klasik & Chaos / Mabar, Kartu Spesial Z-Swap & Z-Shield, tanpa login, langsung buat room bareng teman atau Bot AI.",
  keywords: [
    "unoZ",
    "game kartu online",
    "mabar kartu",
    "uno online indonesia",
    "permainan kartu multiplayer",
    "kartu chaos",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/unoz-logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "unoZ",
    title: "unoZ — Main Kartu Mabar Seru Online & Bot!",
    description:
      "Ajak teman mabar kartu online tanpa login! Lengkap dengan Tumpuk +2/+4, Aturan 7-0, Potong Giliran, dan Kartu Spesial Z-Swap & Z-Shield.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Logo unoZ — Main Kartu Mabar Seru Online & Bot!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "unoZ — Main Kartu Mabar Seru Online & Bot!",
    description:
      "Ajak teman mabar kartu online tanpa login! Lengkap dengan mode Chaos / Mabar dan Kartu Spesial Z.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: "unoZ",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090d1a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${fredoka.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 dark:bg-[#090d1a] dark:text-slate-50 selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
