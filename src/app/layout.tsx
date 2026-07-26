import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { DM_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { PageLoader } from "@/app/components/shared/PageLoader";
import { RouteTransition } from "@/app/components/shared/RouteTransition";
import { Providers } from "@/app/providers";
import "@/styles/index.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-mono",
  display: "swap",
});

const SITE_URL = "https://kudiclip.com";
const SITE_NAME = "KudiClip";
const SITE_DESCRIPTION =
  "Nigerian campaigns. Naira payouts. Clip Afrobeats drops, skits, and brand content — earn per every 1,000 views.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00E878",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KudiClip — Get Paid to Clip",
    template: "%s — KudiClip",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "entertainment",
  keywords: [
    "KudiClip",
    "clipping",
    "Nigeria",
    "Naira payouts",
    "TikTok campaigns",
    "Instagram Reels",
    "YouTube Shorts",
    "content creators",
    "Afrobeats",
    "brand campaigns",
    "CPM",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "KudiClip — Get Paid to Clip",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "KudiClip — Get Paid to Clip",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${plusJakarta.variable} ${dmMono.variable}`}
    >
      <body
        className={`${plusJakarta.className} h-full m-0 bg-background text-foreground antialiased overflow-x-hidden`}
      >
        <Suspense fallback={<PageLoader />}>
          <Providers>
            <RouteTransition>{children}</RouteTransition>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
