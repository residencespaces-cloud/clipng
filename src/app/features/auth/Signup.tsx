"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  Wallet,
} from "lucide-react";
import type { AuthRole } from "@/app/types";
import { emitNavigationStart } from "@/app/lib/page-transition";
import { useAuth } from "@/app/lib/auth/auth-context";
import { BankAccountFields, type BankAccountValue } from "@/app/components/shared/BankAccountFields";
import { AuthShell } from "./AuthShell";
import { Field } from "./Field";
import { inputClass } from "./inputClass";
import { RolePicker } from "./RolePicker";

export function Signup({ initialRole = "clipper" }: { initialRole?: AuthRole }) {
  const router = useRouter();
  const { signupClipper, signupFunder } = useAuth();
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bankVerified, setBankVerified] = useState(false);
  const [bank, setBank] = useState<BankAccountValue>({
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    business: "",
  });

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) {
      setError("Fill in name, email, phone, and password.");
      return;
    }
    if (role === "funder" && !form.business.trim()) {
      setError("Add your business / brand name to continue.");
      return;
    }
    if (role === "clipper") {
      if (!bank.bankCode || bank.accountNumber.length !== 10) {
        setError("Select your bank and enter a 10-digit account number.");
        return;
      }
      if (!bankVerified || !bank.accountName) {
        setError("Wait for Paystack to verify your account name before continuing.");
        return;
      }
    }
    setLoading(true);
    try {
      if (role === "clipper") {
        await signupClipper({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          bankCode: bank.bankCode,
          bankName: bank.bankName,
          accountNumber: bank.accountNumber,
        });
      } else {
        await signupFunder({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          business: form.business,
        });
      }
      emitNavigationStart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={() => { emitNavigationStart(); router.push("/"); }}>
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Join the loop</p>
          <h1 className="text-5xl font-black uppercase leading-none" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            Sign Up
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Nigerian campaigns. Naira payouts. No follower minimum.
          </p>
        </div>

        <form onSubmit={submit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <p className="text-xs text-muted-foreground mb-2">I want to</p>
            <RolePicker role={role} onChange={setRole} />
            <p className="text-xs text-muted-foreground mt-2">
              {role === "clipper"
                ? "Clip content, submit links, get paid weekly."
                : "Fund campaigns, set CPM, pay budget upfront via Paystack."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={form.name} onChange={set("name")} placeholder="Adaeze Obi" className={`${inputClass} pl-9`} />
              </div>
            </Field>
            <Field label="Phone">
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="0801 234 5678" className={`${inputClass} pl-9`} />
              </div>
            </Field>
          </div>

          <Field label="Email">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" className={`${inputClass} pl-9`} />
            </div>
          </Field>

          <Field label="Password">
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 8 characters"
                className={`${inputClass} pl-9 pr-10`}
                autoComplete="new-password"
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

          {role === "funder" ? (
            <Field label="Business / brand name">
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={form.business} onChange={set("business")} placeholder="Spaceship Collective" className={`${inputClass} pl-9`} />
              </div>
            </Field>
          ) : (
            <div className="space-y-4 pt-1 border-t border-border">
              <p className="text-xs font-mono text-accent uppercase tracking-widest pt-3">Payout details</p>
              <BankAccountFields
                value={bank}
                onChange={setBank}
                onVerifiedChange={setBankVerified}
              />
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2.5">
                <Wallet size={14} className="text-primary shrink-0 mt-0.5" />
                We verify your account with Paystack so weekly payouts land in the right account.
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (role === "clipper" && !bankVerified)}
            className="w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {loading ? "Creating account…" : `Create ${role === "clipper" ? "Clipper" : "Funder"} account`}
          </button>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By signing up you agree to KudiClip campaign rules and payout terms.
          </p>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
