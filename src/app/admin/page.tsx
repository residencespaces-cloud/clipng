import type { Metadata } from "next";
import { AdminPanel } from "@/app/features/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Admin — ClipNG",
};

export default function AdminPage() {
  return <AdminPanel />;
}
