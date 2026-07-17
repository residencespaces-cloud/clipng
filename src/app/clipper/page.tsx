import type { Metadata } from "next";
import { ClipperDashboard } from "@/app/features/clipper/ClipperDashboard";

export const metadata: Metadata = {
  title: "Clipper Dashboard — ClipNG",
};

export default function ClipperPage() {
  return <ClipperDashboard />;
}
