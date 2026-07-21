"use client";

import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { AuthProvider } from "@/app/lib/auth/auth-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
