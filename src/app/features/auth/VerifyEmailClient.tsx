"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { publicFetch } from "@/app/lib/api/client";
import { AuthShell } from "@/app/features/auth/AuthShell";

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification link.");
      return;
    }
    publicFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setStatus("ok");
        setMessage("Email verified. You can log in now.");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Verification failed");
      });
  }, [token]);

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Email</p>
        <h1 className="text-4xl font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
          Verify
        </h1>
        <p className={`mt-4 text-sm ${status === "error" ? "text-red-400" : "text-muted-foreground"}`}>
          {message}
        </p>
        {status !== "working" && (
          <Link href="/login" className="inline-block mt-6 text-sm text-primary hover:underline">
            Go to login
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
