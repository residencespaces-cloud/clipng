import type { Metadata } from "next";
import { FunderDashboard } from "@/app/features/funder/FunderDashboard";

export const metadata: Metadata = {
  title: "Funder Dashboard — ClipNG",
};

export default function FunderPage() {
  return <FunderDashboard />;
}
