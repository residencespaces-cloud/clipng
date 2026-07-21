import type { Metadata } from "next";
import { AdminPanel } from "@/app/features/admin/AdminPanel";
import { RoleGate } from "@/app/components/shared/RoleGate";

export const metadata: Metadata = {
  title: "Admin — ClipNG",
};

export default function AdminPage() {
  return (
    <RoleGate role="admin">
      <AdminPanel />
    </RoleGate>
  );
}
