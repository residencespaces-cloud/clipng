import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/app/components/shared/BrandLogo";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist on KudiClip.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
    >
      <BrandLogo size="lg" href="/" />
      <p className="text-primary text-xs font-mono uppercase tracking-widest mt-10 mb-3">404</p>
      <h1
        className="text-5xl font-black uppercase text-center"
        style={{ fontFamily: "var(--font-big-shoulders), 'Big Shoulders Display', sans-serif" }}
      >
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        <Link
          href="/"
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90"
        >
          Back to home
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2.5 border border-border text-sm rounded hover:border-primary/40"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
