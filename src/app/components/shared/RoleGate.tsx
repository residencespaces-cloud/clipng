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
    // #region agent log
    fetch("http://127.0.0.1:7702/ingest/7d7698e3-42d0-49ee-83ba-8f42b016a321", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "0731d3",
      },
      body: JSON.stringify({
        sessionId: "0731d3",
        runId: "run1",
        hypothesisId: "H2",
        location: "src/app/components/shared/RoleGate.tsx:18",
        message: "RoleGate auth state",
        data: {
          expectedRole: role,
          loading,
          hasUser: Boolean(user),
          userRole: user?.role ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (loading) return;
    if (!user) {
      // #region agent log
      fetch("http://127.0.0.1:7702/ingest/7d7698e3-42d0-49ee-83ba-8f42b016a321", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "0731d3",
        },
        body: JSON.stringify({
          sessionId: "0731d3",
          runId: "run1",
          hypothesisId: "H3",
          location: "src/app/components/shared/RoleGate.tsx:20",
          message: "RoleGate redirecting unauthenticated user",
          data: {
            expectedRole: role,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      const dest =
        user.role === "admin" ? "/admin" : user.role === "funder" ? "/funder" : "/clipper";
      // #region agent log
      fetch("http://127.0.0.1:7702/ingest/7d7698e3-42d0-49ee-83ba-8f42b016a321", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "0731d3",
        },
        body: JSON.stringify({
          sessionId: "0731d3",
          runId: "run1",
          hypothesisId: "H4",
          location: "src/app/components/shared/RoleGate.tsx:28",
          message: "RoleGate redirecting wrong-role user",
          data: {
            expectedRole: role,
            actualRole: user.role,
            redirectTo: dest,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      router.replace(dest);
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
