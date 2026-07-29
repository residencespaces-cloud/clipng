"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { publicFetch } from "@/app/lib/api/client";
import { AuthShell } from "@/app/features/auth/AuthShell";
import { Field } from "@/app/features/auth/Field";
import { inputClass } from "@/app/features/auth/inputClass";

export function ResetPasswordClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    setLoading(true);
    try {
      await publicFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Account</p>
        <h1 className="text-4xl font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
          New password
        </h1>

        {done ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Password updated.{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        ) : (
          <form onSubmit={submit} className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5 mt-6">
            <Field label="New password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                minLength={8}
                required
              />
            </Field>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
