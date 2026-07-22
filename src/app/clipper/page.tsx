import type { Metadata } from "next";
import { ClipperDashboard } from "@/app/features/clipper/ClipperDashboard";
import { RoleGate } from "@/app/components/shared/RoleGate";

export const metadata: Metadata = {
  title: "Clipper Dashboard — KudiClip",
};

export default function ClipperPage() {
  return (
    <RoleGate role="clipper">
      <ClipperDashboard />
    </RoleGate>
  );
}
