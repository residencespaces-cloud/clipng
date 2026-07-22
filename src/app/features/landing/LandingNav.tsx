"use client";

import Link from "next/link";
import { BrandLogo } from "@/app/components/shared/BrandLogo";

export function LandingNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <BrandLogo size="xl" compact />
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#benefits" className="hover:text-foreground transition-colors">For creators</a>
          <a href="#campaigns" className="hover:text-foreground transition-colors">Campaigns</a>
          <a href="#money" className="hover:text-foreground transition-colors">Earnings</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm rounded border border-border hover:border-primary/50 hover:text-primary transition-all"
          >
            Log in
          </Link>
          <Link
            href="/signup?role=clipper"
            className="px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
