"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { publicFetch } from "@/app/lib/api/client";
import { AuthShell } from "@/app/features/auth/AuthShell";
import { Field } from "@/app/features/auth/Field";
import { inputClass } from "@/app/features/auth/inputClass";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await publicFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Account</p>
        <h1 className="text-4xl font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
          Reset
        </h1>
        <p className="text-sm text-muted-foreground mt-3">
          Enter your email and we&apos;ll send a password reset link.
        </p>

        {done ? (
          <p className="mt-6 text-sm text-muted-foreground">
            If an account exists for that email, a reset link is on the way.{" "}
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        ) : (
          <form onSubmit={submit} className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5 mt-6">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </Field>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
