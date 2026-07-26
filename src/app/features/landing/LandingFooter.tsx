import Link from "next/link";
import { BrandLogo } from "@/app/components/shared/BrandLogo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <BrandLogo size="lg" />
        <p className="text-sm text-muted-foreground">Nigerian campaigns. Naira payouts. Real views.</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/signup?role=clipper" className="hover:text-foreground transition-colors">
            Clippers
          </Link>
          <Link href="/signup?role=funder" className="hover:text-foreground transition-colors">
            Funders
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </footer>
  );
}
