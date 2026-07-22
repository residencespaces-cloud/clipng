import Link from "next/link";
import { BrandLogo } from "@/app/components/shared/BrandLogo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <BrandLogo size="xl" />
        <p className="text-sm text-muted-foreground">Nigerian campaigns. Naira payouts. Real views.</p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/clipper" className="hover:text-foreground transition-colors">Clippers</Link>
          <Link href="/funder" className="hover:text-foreground transition-colors">Funders</Link>
          <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
