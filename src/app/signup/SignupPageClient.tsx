"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Signup } from "@/app/features/auth/Signup";
import type { AuthRole } from "@/app/types";

function SignupWithRole() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: AuthRole = roleParam === "funder" ? "funder" : "clipper";

  return <Signup key={initialRole} initialRole={initialRole} />;
}

export function SignupPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignupWithRole />
    </Suspense>
  );
}
