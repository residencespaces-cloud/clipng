"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/app/components/shared/PageLoader";
import { useAuth } from "@/app/lib/auth/auth-context";

export function RoleGate({
  role,
  children,
}: {
  role: "clipper" | "funder" | "admin";
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      const dest =
        user.role === "admin" ? "/admin" : user.role === "funder" ? "/funder" : "/clipper";
      router.replace(dest);
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
