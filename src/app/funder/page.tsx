import type { Metadata } from "next";
import { Suspense } from "react";
import { FunderDashboard } from "@/app/features/funder/FunderDashboard";
import { RoleGate } from "@/app/components/shared/RoleGate";
import { PageLoader } from "@/app/components/shared/PageLoader";

export const metadata: Metadata = {
  title: "Funder Dashboard — ClipNG",
};

export default function FunderPage() {
  return (
    <RoleGate role="funder">
      <Suspense fallback={<PageLoader />}>
        <FunderDashboard />
      </Suspense>
    </RoleGate>
  );
}
