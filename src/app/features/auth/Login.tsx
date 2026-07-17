"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import type { AuthRole } from "@/app/types";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";
import { inputClass } from "./inputClass";
import { RolePicker } from "./RolePicker";

export function Login({ initialRole = "clipper" }: { initialRole?: AuthRole }) {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(role === "clipper" ? "/clipper" : "/funder");
    }, 700);
  };

  return (
    <AuthShell onBack={() => router.push("/")}>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Welcome back</p>
          <h1 className="text-5xl font-black uppercase leading-none" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            Log In
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Access your campaigns, clips, and Naira payouts.
          </p>
        </div>

        <form onSubmit={submit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <p className="text-xs text-muted-foreground mb-2">I am a</p>
            <RolePicker role={role} onChange={setRole} />
          </div>

          <Field label="Email or phone">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com or 080…"
                className={`${inputClass} pl-9`}
                autoComplete="username"
              />
            </div>
          </Field>

          <Field label="Password">
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pl-9 pr-10`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
              <input type="checkbox" className="rounded border-border bg-input-background" />
              Remember me
            </label>
            <button type="button" className="text-primary hover:underline">Forgot password?</button>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {loading ? "Signing in…" : `Continue as ${role === "clipper" ? "Clipper" : "Funder"}`}
          </button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          New to ClipNG?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
