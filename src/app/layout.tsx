import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { preloaderScript } from "@/components/layout/preloader";
import { site } from "@/lib/site";
import { media } from "@/lib/media";
import "./globals.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Premium Gym & Performance Club in ${site.address.city}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: ["gym", "fitness centre", "personal training", "strength training", "HIIT", "gym membership", site.address.city, "Indiranagar gym"],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — Build your strongest self`,
    description: site.description,
    images: [{ url: media.og, width: 1200, height: 630, alt: "ATHLEX training floor" }],
  },
  twitter: { card: "summary_large_image", title: `${site.name} — Build your strongest self`, description: site.description, images: [media.og] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#060606",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${anton.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
      </head>
      <body className="grain min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
