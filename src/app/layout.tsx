import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "ClipNG — Get Paid to Clip",
  description:
    "Nigerian campaigns. Naira payouts. Clip Afrobeats drops, skits, and brand content — earn per every 1,000 views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
