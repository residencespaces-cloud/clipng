import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordClient } from "@/app/features/auth/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
