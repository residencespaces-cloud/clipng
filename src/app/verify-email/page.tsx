import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailClient } from "@/app/features/auth/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}
