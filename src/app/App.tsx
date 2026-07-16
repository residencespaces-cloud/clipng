"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  Play,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  BarChart2,
  Upload,
  Eye,
  EyeOff,
  Wallet,
  Settings,
  Menu,
  X,
  ExternalLink,
  AlertCircle,
  ArrowUpRight,
  Film,
  Zap,
  Shield,
  Globe,
  Mail,
  Lock,
  Phone,
  User,
  Building2,
  ArrowLeft,
  TrendingUp,
  Podcast,
  Target,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "landing" | "login" | "signup" | "clipper" | "funder" | "admin";
type AuthRole = "clipper" | "funder";
type ClipperTab = "overview" | "campaigns" | "clips" | "earnings";
type FunderTab = "overview" | "campaigns" | "create" | "billing";
type AdminTab = "pending" | "approved" | "all-campaigns" | "payouts";
type CreateStep = 1 | 2 | 3;

// ─── Data ─────────────────────────────────────────────────────────────────────

const CAMPAIGNS = [
  {
    id: 1,
    name: "Burna Boy — 'City Boys' Drop",
    funder: "Spaceship Collective",
    cpm: 600,
    budget: 300000,
    remaining: 187400,
    views: 187667,
    clips: 34,
    platforms: ["TikTok", "Instagram"],
    status: "Active",
    end: "2024-02-15",
    description: "Clip the 'City Boys' official video. Must include #CityBoysNG caption. Minimum 30s clip.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1767661667474-4f2a197c9a51?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 2,
    name: "Flutterwave Brand Push",
    funder: "Flutterwave Marketing",
    cpm: 500,
    budget: 500000,
    remaining: 341200,
    views: 317600,
    clips: 52,
    platforms: ["TikTok", "YouTube"],
    status: "Active",
    end: "2024-02-28",
    description: "Showcase how Flutterwave simplifies payments. Include #SendMoneyNG tag.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 3,
    name: "Falz x MTN Campaign",
    funder: "MTN Nigeria",
    cpm: 450,
    budget: 200000,
    remaining: 44500,
    views: 345556,
    clips: 67,
    platforms: ["TikTok", "Instagram", "YouTube"],
    status: "Active",
    end: "2024-02-10",
    description: "Clip the Falz x MTN collaboration. Must include #MTNxFalz in caption.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1733953096768-8b060f824587?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 4,
    name: "Mr Macaroni — Nollywood Skit",
    funder: "Debo Adedayo Ent.",
    cpm: 400,
    budget: 100000,
    remaining: 100000,
    views: 0,
    clips: 0,
    platforms: ["TikTok", "Instagram"],
    status: "Active",
    end: "2024-03-01",
    description: "Best moments from latest skit drop. Caption: #MrMacaroni2024. Min 15s.",
    asset: "https://drive.google.com/",
    image: "https://images.unsplash.com/photo-1638389747564-c7cc1c9f7a49?auto=format&fit=crop&w=1200&q=85",
  },
];

const PENDING_CLIPS = [
  { id: 1, clipper: "Adaeze Obi", campaign: "Burna Boy — 'City Boys' Drop", platform: "TikTok", link: "https://tiktok.com/", date: "2024-01-28", views: 0, status: "Pending" },
  { id: 2, clipper: "Emeka Chukwu", campaign: "Flutterwave Brand Push", platform: "YouTube", link: "https://youtube.com/", date: "2024-01-27", views: 0, status: "Pending" },
  { id: 3, clipper: "Fatima Bello", campaign: "Burna Boy — 'City Boys' Drop", platform: "Instagram", link: "https://instagram.com/", date: "2024-01-27", views: 0, status: "Pending" },
  { id: 4, clipper: "Tunde Adeleke", campaign: "Falz x MTN Campaign", platform: "TikTok", link: "https://tiktok.com/", date: "2024-01-26", views: 0, status: "Pending" },
  { id: 5, clipper: "Chisom Eze", campaign: "Flutterwave Brand Push", platform: "TikTok", link: "https://tiktok.com/", date: "2024-01-25", views: 0, status: "Pending" },
];

const MY_CLIPS = [
  { id: 1, campaign: "Burna Boy — 'City Boys' Drop", platform: "TikTok", date: "2024-01-20", status: "Paid", views: 84200, earnings: 40416 },
  { id: 2, campaign: "Flutterwave Brand Push", platform: "YouTube", date: "2024-01-22", status: "Verified", views: 32100, earnings: 12840 },
  { id: 3, campaign: "Falz x MTN Campaign", platform: "TikTok", date: "2024-01-25", status: "Pending", views: 0, earnings: 0 },
  { id: 4, campaign: "Burna Boy — 'City Boys' Drop", platform: "Instagram", date: "2024-01-27", status: "Approved", views: 18900, earnings: 7560 },
];

const PAYOUTS = [
  { id: 1, date: "2024-01-21", clipper: "Adaeze Obi", campaign: "Burna Boy — 'City Boys' Drop", amount: 40416, status: "Paid" },
  { id: 2, date: "2024-01-21", clipper: "Emeka Chukwu", campaign: "Falz x MTN Campaign", amount: 27000, status: "Paid" },
  { id: 3, date: "2024-01-21", clipper: "Fatima Bello", campaign: "Flutterwave Brand Push", amount: 16000, status: "Paid" },
  { id: 4, date: "2024-01-28", clipper: "Tunde Adeleke", campaign: "Burna Boy — 'City Boys' Drop", amount: 19200, status: "Triggered" },
  { id: 5, date: "2024-01-28", clipper: "Chisom Eze", campaign: "Flutterwave Brand Push", amount: 8400, status: "Pending" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    Approved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    Verified: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Triggered: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/15",
    Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Paused: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    Exhausted: "bg-red-500/15 text-red-400 border-red-500/20",
    Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function PlatformBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    TikTok: "bg-pink-500/15 text-pink-400",
    Instagram: "bg-purple-500/15 text-purple-400",
    YouTube: "bg-red-500/15 text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${map[p] ?? ""}`}>{p}</span>
  );
}

function BudgetBar({ remaining, total }: { remaining: number; total: number }) {
  const usedPct = Math.min(100, Math.round(((total - remaining) / total) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>{fmt(remaining)} left</span>
        <span>{usedPct}% used</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${usedPct}%` }} />
      </div>
    </div>
  );
}

// ─── Auth shared bits ─────────────────────────────────────────────────────────

function AuthShell({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[380px] h-[380px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} />
            <span className="text-xl font-black tracking-tight" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
              CLIP<span className="text-primary">NG</span>
            </span>
          </button>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Auth</span>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-6 py-12 min-h-[calc(100vh-3.5rem)]">
        {children}
      </div>
    </div>
  );
}

function RolePicker({
  role,
  onChange,
}: {
  role: AuthRole;
  onChange: (r: AuthRole) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
      {([
        { key: "clipper" as const, label: "Clipper", icon: <Film size={14} /> },
        { key: "funder" as const, label: "Funder", icon: <Building2 size={14} /> },
      ]).map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => onChange(r.key)}
          className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-md transition-all ${
            role === r.key
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {r.icon} {r.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground";

// ─── Login ────────────────────────────────────────────────────────────────────

function Login({
  onNavigate,
  onSuccess,
  initialRole = "clipper",
}: {
  onNavigate: (v: View) => void;
  onSuccess: (role: AuthRole) => void;
  initialRole?: AuthRole;
}) {
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
      onSuccess(role);
    }, 700);
  };

  return (
    <AuthShell onBack={() => onNavigate("landing")}>
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
          <button onClick={() => onNavigate("signup")} className="text-primary font-medium hover:underline">
            Create an account
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

// ─── Signup ───────────────────────────────────────────────────────────────────

function Signup({
  onNavigate,
  onSuccess,
  initialRole = "clipper",
}: {
  onNavigate: (v: View) => void;
  onSuccess: (role: AuthRole) => void;
  initialRole?: AuthRole;
}) {
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    business: "",
    bankName: "",
    accountNumber: "",
  });

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
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
    if (role === "clipper" && (!form.bankName.trim() || !form.accountNumber.trim())) {
      setError("Add bank details so we can pay you via Paystack.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(role);
    }, 800);
  };

  return (
    <AuthShell onBack={() => onNavigate("landing")}>
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
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Bank name">
                  <input type="text" value={form.bankName} onChange={set("bankName")} placeholder="GTBank" className={inputClass} />
                </Field>
                <Field label="Account number">
                  <input type="text" value={form.accountNumber} onChange={set("accountNumber")} placeholder="0123456789" className={inputClass} inputMode="numeric" />
                </Field>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2.5">
                <Wallet size={14} className="text-primary shrink-0 mt-0.5" />
                Weekly Paystack payouts land in this account once views are verified.
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
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {loading ? "Creating account…" : `Create ${role === "clipper" ? "Clipper" : "Funder"} account`}
          </button>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By signing up you agree to ClipNG campaign rules and payout terms.
          </p>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className="text-primary font-medium hover:underline">
            Log in
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

function Landing({
  onNavigate,
  onStartSignup,
}: {
  onNavigate: (v: View) => void;
  onStartSignup: (role: AuthRole) => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            CLIP<span className="text-primary">NG</span>
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#benefits" className="hover:text-foreground transition-colors">For creators</a>
            <a href="#campaigns" className="hover:text-foreground transition-colors">Campaigns</a>
            <a href="#money" className="hover:text-foreground transition-colors">Earnings</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("login")}
              className="px-4 py-1.5 text-sm rounded border border-border hover:border-primary/50 hover:text-primary transition-all"
            >
              Log in
            </button>
            <button
              onClick={() => onStartSignup("clipper")}
              className="px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                12 active campaigns · ₦2.4M paid out
              </div>
              <h1
                className="text-6xl lg:text-8xl font-black leading-none uppercase mb-6"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}
              >
                Get Paid<br />
                <span className="text-primary">to Clip.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Nigerian campaigns. Naira payouts. No follower minimum. Clip Afrobeats drops, skits, and brand content — earn per every 1,000 views.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => onStartSignup("clipper")}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-all"
                >
                  Start Clipping <ArrowUpRight size={16} />
                </button>
                <button
                  onClick={() => onStartSignup("funder")}
                  className="flex items-center gap-2 px-6 py-3 border border-border rounded hover:border-accent hover:text-accent transition-all"
                >
                  Fund a Campaign <Film size={16} />
                </button>
              </div>
              <div className="flex gap-8 pt-6 border-t border-border">
                {[
                  { label: "Paid out", value: "₦2.4M" },
                  { label: "Clips verified", value: "847" },
                  { label: "Active campaigns", value: "12" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live campaign card */}
            <div className="relative">
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Live Campaign</span>
                  <StatusBadge status="Active" />
                </div>
                <div className="relative bg-secondary rounded-lg overflow-hidden aspect-video group">
                  <img
                    src={CAMPAIGNS[0].image}
                    alt={CAMPAIGNS[0].name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
                    <p className="text-xs text-white font-mono">{"Burna Boy — 'City Boys' Drop"}</p>
                    <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Play size={15} fill="currentColor" />
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["TikTok", "Instagram"].map((p) => <PlatformBadge key={p} p={p} />)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Your CPM</div>
                    <div className="text-lg font-black text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>₦480</div>
                    <div className="text-xs text-muted-foreground">per 1k views</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Budget left</div>
                    <div className="text-lg font-black text-accent" style={{ fontFamily: "'DM Mono', monospace" }}>₦187K</div>
                    <div className="text-xs text-muted-foreground">of ₦300K</div>
                  </div>
                </div>
                <BudgetBar remaining={187400} total={300000} />
                <button
                  onClick={() => onNavigate("clipper")}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all"
                >
                  Join Campaign →
                </button>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border border-primary/30 rounded-lg px-4 py-3 shadow-xl">
                <div className="text-xs text-muted-foreground">Adaeze earned last week</div>
                <div className="text-xl font-black text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>₦40,416</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">The loop</p>
            <h2 className="text-5xl font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <DollarSign size={24} />, num: "01", title: "Funder pays", body: "Artist or brand sets a CPM and total budget. Pays upfront via Paystack. Campaign goes live once payment clears." },
              { icon: <Film size={24} />, num: "02", title: "Clipper clips", body: "Download the source asset, edit your clip, post to TikTok, IG, or YouTube. Submit your public link." },
              { icon: <Shield size={24} />, num: "03", title: "Admin verifies", body: "Weekly manual review: quality check, view count recorded, suspicious velocity flagged. First-verified, first-paid." },
              { icon: <Zap size={24} />, num: "04", title: "Naira payout", body: "80% of CPM lands in your account via Paystack every week. ₦600 CPM → you earn ₦480 per 1k views." },
            ].map((s) => (
              <div key={s.num} className="relative bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group">
                <div className="absolute top-4 right-4 text-4xl font-black text-border" style={{ fontFamily: "'DM Mono', monospace" }}>{s.num}</div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  {s.icon}
                </div>
                <h3 className="font-bold mb-2 capitalize">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator benefits */}
      <section id="benefits" className="py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <p className="text-accent text-xs font-mono uppercase tracking-widest mb-2">For creators, streamers & brands</p>
              <h2 className="text-5xl font-black uppercase leading-none mb-5" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
                Make your content<br />
                <span className="text-primary">travel further.</span>
              </h2>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                Turn one podcast, stream, music video, or campaign into dozens of short-form moments—shared by creators who already understand the culture.
              </p>
              <button
                onClick={() => onStartSignup("funder")}
                className="mt-7 flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground text-sm font-bold rounded hover:bg-accent/90 transition-all"
              >
                Grow your reach <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <TrendingUp size={20} />,
                  title: "Increase virality",
                  body: "Give every strong moment more chances to find its audience.",
                },
                {
                  icon: <Podcast size={20} />,
                  title: "More from every stream",
                  body: "Turn long-form podcasts, VODs, and live streams into shareable short clips.",
                },
                {
                  icon: <Target size={20} />,
                  title: "Reach new audiences",
                  body: "Distribute through real creators across TikTok, Reels, and Shorts.",
                },
              ].map((benefit) => (
                <div key={benefit.title} className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-5">
                    {benefit.icon}
                  </div>
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live campaigns */}
      <section id="campaigns" className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Open now</p>
              <h2 className="text-5xl font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>Live Campaigns</h2>
            </div>
            <button onClick={() => onNavigate("clipper")} className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAMPAIGNS.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors">
                <div className="relative bg-secondary rounded-lg aspect-video overflow-hidden group">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center">
                    <Play size={13} fill="currentColor" />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.funder}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {c.platforms.map((p) => <PlatformBadge key={p} p={p} />)}
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-primary font-bold">{fmt(Math.round(c.cpm * 0.8))}/1k</span>
                  <span className="text-muted-foreground">you earn</span>
                </div>
                <BudgetBar remaining={c.remaining} total={c.budget} />
                <button
                  onClick={() => onNavigate("clipper")}
                  className="w-full py-2 text-xs font-bold bg-primary/10 text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20"
                >
                  Join Campaign
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money math */}
      <section id="money" className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary text-xs font-mono uppercase tracking-widest mb-2">Do the math</p>
              <h2 className="text-5xl font-black uppercase mb-6" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
                Real money.<br />Every week.
              </h2>
              <p className="text-muted-foreground mb-8">
                No follower minimum. No niche requirement. Your existing TikTok or Instagram account is enough.
              </p>
              {[
                { icon: <Globe size={16} />, text: "Any Nigerian TikTok, IG, or YouTube account qualifies" },
                { icon: <Clock size={16} />, text: "Weekly payout cycle — no waiting months" },
                { icon: <Wallet size={16} />, text: "Naira straight to your bank via Paystack" },
                { icon: <Users size={16} />, text: "No minimum follower count" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 mb-3 text-sm">
                  <span className="text-primary">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <p className="text-sm text-muted-foreground mb-6">Earnings example</p>
              {[
                { label: "Campaign CPM", value: "₦600 / 1k views", sub: "set by funder", highlight: false },
                { label: "Platform take (20%)", value: "₦120 / 1k", sub: "our fee", highlight: false },
                { label: "Your rate (80%)", value: "₦480 / 1k views", sub: "yours to keep", highlight: true },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                  <div>
                    <p className={`text-sm font-medium ${r.highlight ? "text-primary" : ""}`}>{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.sub}</p>
                  </div>
                  <span className={`font-mono font-bold text-lg ${r.highlight ? "text-primary" : ""}`} style={{ fontFamily: "'DM Mono', monospace" }}>{r.value}</span>
                </div>
              ))}
              <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Your clip gets 50,000 views →</p>
                <p className="text-3xl font-black text-primary" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>₦24,000 earned</p>
                <p className="text-xs text-muted-foreground mt-1">50k ÷ 1000 × ₦480 = ₦24,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            CLIP<span className="text-primary">NG</span>
          </span>
          <p className="text-sm text-muted-foreground">Nigerian campaigns. Naira payouts. Real views.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <button onClick={() => onNavigate("clipper")} className="hover:text-foreground transition-colors">Clippers</button>
            <button onClick={() => onNavigate("funder")} className="hover:text-foreground transition-colors">Funders</button>
            <button onClick={() => onNavigate("admin")} className="hover:text-foreground transition-colors">Admin</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Clipper Dashboard ────────────────────────────────────────────────────────

function ClipperDashboard() {
  const [tab, setTab] = useState<ClipperTab>("overview");
  const [joinedCampaign, setJoinedCampaign] = useState<number | null>(null);
  const [clipUrl, setClipUrl] = useState("");
  const [clipPlatform, setClipPlatform] = useState("TikTok");
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems: { key: ClipperTab; label: string; icon: ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart2 size={16} /> },
    { key: "campaigns", label: "Browse Campaigns", icon: <Globe size={16} /> },
    { key: "clips", label: "My Clips", icon: <Film size={16} /> },
    { key: "earnings", label: "Earnings", icon: <Wallet size={16} /> },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static z-40 flex flex-col w-56 bg-sidebar border-r border-sidebar-border h-full transition-transform duration-200`}>
        <div className="flex items-center justify-between px-5 h-14 border-b border-sidebar-border shrink-0">
          <span className="text-lg font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            CLIP<span className="text-primary">NG</span>
          </span>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="px-3 py-3 flex-1 overflow-y-auto">
          <div className="px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg mb-4">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold">Adaeze Obi</p>
            <p className="text-xs text-primary font-mono">Clipper</p>
          </div>
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${tab === item.key ? "bg-primary/10 text-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3 pb-4 shrink-0">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <Settings size={16} /> Settings
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center gap-4 px-6 h-14 border-b border-border shrink-0">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <h2 className="text-sm font-semibold">
            {sidebarItems.find((i) => i.key === tab)?.label}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6">

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Earned", value: "₦53,256", sub: "all time", color: "text-primary" },
                  { label: "Pending Payout", value: "₦7,560", sub: "this week", color: "text-accent" },
                  { label: "Clips Submitted", value: "4", sub: "total", color: "text-foreground" },
                  { label: "Clips Verified", value: "2", sub: "paid out", color: "text-foreground" },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent Clips</h3>
                  <button onClick={() => setTab("clips")} className="text-xs text-primary hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Campaign", "Platform", "Status", "Views", "Earnings"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MY_CLIPS.map((c) => (
                        <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-sm">{c.campaign}</td>
                          <td className="px-5 py-3"><PlatformBadge p={c.platform} /></td>
                          <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                          <td className="px-5 py-3 font-mono text-xs">{c.views ? c.views.toLocaleString() : "—"}</td>
                          <td className="px-5 py-3 font-mono text-xs text-primary">{c.earnings ? fmt(c.earnings) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Browse Campaigns */}
          {tab === "campaigns" && (
            <div className="grid md:grid-cols-2 gap-4">
              {CAMPAIGNS.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="relative aspect-[16/7] rounded-lg overflow-hidden bg-secondary group">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center">
                      <Play size={13} fill="currentColor" />
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold leading-snug">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.funder}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    {c.platforms.map((p) => <PlatformBadge key={p} p={p} />)}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Your CPM</p>
                      <p className="font-mono font-bold text-primary text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(Math.round(c.cpm * 0.8))}</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Budget left</p>
                      <p className="font-mono font-bold text-accent text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.remaining)}</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Clips in</p>
                      <p className="font-mono font-bold text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{c.clips}</p>
                    </div>
                  </div>
                  <BudgetBar remaining={c.remaining} total={c.budget} />

                  {joinedCampaign === c.id ? (
                    <div className="bg-secondary rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Submit your clip</p>
                        <button onClick={() => setJoinedCampaign(null)} className="text-muted-foreground hover:text-foreground">
                          <X size={14} />
                        </button>
                      </div>
                      <a href={c.asset} className="flex items-center gap-2 text-xs text-primary hover:underline">
                        <Upload size={12} /> Download source asset
                      </a>
                      <div className="space-y-2">
                        <select
                          value={clipPlatform}
                          onChange={(e) => setClipPlatform(e.target.value)}
                          className="w-full bg-input-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {c.platforms.map((p) => <option key={p}>{p}</option>)}
                        </select>
                        <input
                          type="url"
                          placeholder="Paste your public post link..."
                          value={clipUrl}
                          onChange={(e) => setClipUrl(e.target.value)}
                          className="w-full bg-input-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                        />
                        {submitted ? (
                          <div className="flex items-center gap-2 text-sm text-primary py-2">
                            <CheckCircle size={14} /> Clip submitted! Pending review.
                          </div>
                        ) : (
                          <button
                            onClick={() => { if (clipUrl) setSubmitted(true); }}
                            className="w-full py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all"
                          >
                            Submit Clip
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setJoinedCampaign(c.id); setSubmitted(false); setClipUrl(""); }}
                      className="w-full py-2.5 bg-primary/10 text-primary text-sm font-bold rounded hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20"
                    >
                      Join Campaign
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* My Clips */}
          {tab === "clips" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">All Submitted Clips</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Campaign", "Platform", "Date", "Status", "Views", "Earnings"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MY_CLIPS.map((c) => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                        <td className="px-5 py-3 font-medium">{c.campaign}</td>
                        <td className="px-5 py-3"><PlatformBadge p={c.platform} /></td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.date}</td>
                        <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-3 font-mono text-xs">{c.views ? c.views.toLocaleString() : "—"}</td>
                        <td className="px-5 py-3 font-mono text-xs text-primary">{c.earnings ? fmt(c.earnings) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Earnings */}
          {tab === "earnings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Earned", value: "₦53,256", color: "text-primary" },
                  { label: "Pending This Week", value: "₦7,560", color: "text-accent" },
                  { label: "Paid Out", value: "₦40,416", color: "text-foreground" },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-3xl font-black ${s.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold">Payout History</h3>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { date: "Jan 21, 2024", campaign: "Burna Boy — 'City Boys' Drop", views: "84,200", amount: "₦40,416", status: "Paid" },
                    { date: "Jan 28, 2024", campaign: "Falz x MTN Campaign", views: "18,900", amount: "₦7,560", status: "Pending" },
                    { date: "Jan 22, 2024", campaign: "Flutterwave Brand Push", views: "32,100", amount: "₦12,840", status: "Verified" },
                  ].map((p, i) => (
                    <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{p.campaign}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.date} · {p.views} views</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-mono font-bold text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{p.amount}</p>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Funder Dashboard ─────────────────────────────────────────────────────────

function FunderDashboard() {
  const [tab, setTab] = useState<FunderTab>("overview");
  const [createStep, setCreateStep] = useState<CreateStep>(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    assetUrl: "",
    description: "",
    platforms: ["TikTok"] as string[],
    cpm: "",
    budget: "",
    start: "",
    end: "",
  });
  const [paidSuccess, setPaidSuccess] = useState(false);

  const cpmNum = parseFloat(form.cpm) || 0;
  const budgetNum = parseFloat(form.budget) || 0;
  const viewCeiling = cpmNum && budgetNum ? Math.round((budgetNum / cpmNum) * 1000) : 0;

  const sidebarItems: { key: FunderTab; label: string; icon: ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart2 size={16} /> },
    { key: "campaigns", label: "My Campaigns", icon: <Film size={16} /> },
    { key: "create", label: "Create Campaign", icon: <Upload size={16} /> },
    { key: "billing", label: "Billing", icon: <Wallet size={16} /> },
  ];

  const togglePlatform = (p: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static z-40 flex flex-col w-56 bg-sidebar border-r border-sidebar-border h-full transition-transform duration-200`}>
        <div className="flex items-center justify-between px-5 h-14 border-b border-sidebar-border shrink-0">
          <span className="text-lg font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            CLIP<span className="text-primary">NG</span>
          </span>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="px-3 py-3 flex-1 overflow-y-auto">
          <div className="px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg mb-4">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold">Spaceship Collective</p>
            <p className="text-xs text-accent font-mono">Funder</p>
          </div>
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${tab === item.key ? "bg-primary/10 text-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center gap-4 px-6 h-14 border-b border-border shrink-0">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <h2 className="text-sm font-semibold">{sidebarItems.find((i) => i.key === tab)?.label}</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6">

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Spent", value: "₦800K", color: "text-accent" },
                  { label: "Views Delivered", value: "850K", color: "text-primary" },
                  { label: "Active Campaigns", value: "3", color: "text-foreground" },
                  { label: "Clips Submitted", value: "153", color: "text-foreground" },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Active Campaigns</h3>
                  <button onClick={() => setTab("create")} className="text-xs text-primary hover:underline">+ New Campaign</button>
                </div>
                <div className="divide-y divide-border">
                  {CAMPAIGNS.slice(0, 2).map((c) => (
                    <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{c.clips} clips · {c.views.toLocaleString()} views</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-mono font-bold text-accent text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.remaining)} left</p>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* My Campaigns */}
          {tab === "campaigns" && (
            <div className="space-y-4">
              {CAMPAIGNS.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">Ends {c.end}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "CPM (gross)", value: fmt(c.cpm) },
                      { label: "Total Budget", value: fmt(c.budget) },
                      { label: "Views Delivered", value: c.views.toLocaleString() },
                      { label: "Clips Submitted", value: String(c.clips) },
                    ].map((s) => (
                      <div key={s.label} className="bg-secondary rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="font-mono font-bold text-sm mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <BudgetBar remaining={c.remaining} total={c.budget} />
                  <div className="flex gap-1">
                    {c.platforms.map((p) => <PlatformBadge key={p} p={p} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Campaign */}
          {tab === "create" && (
            <div className="max-w-2xl space-y-6">
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {([1, 2, 3] as CreateStep[]).map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${createStep >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {createStep > s ? <CheckCircle size={14} /> : s}
                    </div>
                    {s < 3 && <div className={`h-0.5 w-12 transition-colors ${createStep > s ? "bg-primary" : "bg-border"}`} />}
                  </div>
                ))}
                <span className="ml-2 text-xs text-muted-foreground">
                  {createStep === 1 ? "Campaign Details" : createStep === 2 ? "Budget & CPM" : "Review & Pay"}
                </span>
              </div>

              {paidSuccess ? (
                <div className="bg-card border border-primary/30 rounded-xl p-10 text-center space-y-4">
                  <CheckCircle size={48} className="text-primary mx-auto" />
                  <h3 className="text-2xl font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>Campaign Live!</h3>
                  <p className="text-muted-foreground text-sm">Payment confirmed via Paystack. Your campaign is now open to all clippers.</p>
                  <button
                    onClick={() => { setTab("campaigns"); setPaidSuccess(false); setCreateStep(1); }}
                    className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all"
                  >
                    View Campaigns
                  </button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  {/* Step 1 */}
                  {createStep === 1 && (
                    <>
                      <h3 className="font-semibold">Campaign Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1.5">Campaign Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Burna Boy — City Boys Drop"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1.5">Source Asset URL</label>
                          <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={form.assetUrl}
                            onChange={(e) => setForm((f) => ({ ...f, assetUrl: e.target.value }))}
                            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1.5">Brief / Rules for Clippers</label>
                          <textarea
                            placeholder="Required caption, minimum clip length, creative guidelines..."
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            rows={3}
                            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-2">Allowed Platforms</label>
                          <div className="flex gap-2">
                            {["TikTok", "Instagram", "YouTube"].map((p) => (
                              <button
                                key={p}
                                onClick={() => togglePlatform(p)}
                                className={`px-4 py-1.5 text-xs rounded border transition-colors ${form.platforms.includes(p) ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1.5">Start Date</label>
                            <input type="date" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1.5">End Date</label>
                            <input type="date" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setCreateStep(2)} className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all">
                        Continue to Budget →
                      </button>
                    </>
                  )}

                  {/* Step 2 */}
                  {createStep === 2 && (
                    <>
                      <h3 className="font-semibold">Budget & CPM</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1.5">CPM — Cost per 1,000 views (₦)</label>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={form.cpm}
                            onChange={(e) => setForm((f) => ({ ...f, cpm: e.target.value }))}
                            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                          />
                          {cpmNum > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Clippers earn 80% → <span className="text-primary font-mono">{fmt(Math.round(cpmNum * 0.8))}</span> per 1k views
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1.5">Total Budget (₦)</label>
                          <input
                            type="number"
                            placeholder="e.g. 50000"
                            value={form.budget}
                            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                          />
                        </div>
                        {viewCeiling > 0 && (
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Eye size={18} className="text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-primary">Implied View Ceiling</p>
                                <p className="text-2xl font-black text-primary mt-1" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
                                  {viewCeiling.toLocaleString()} views
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {fmt(budgetNum)} ÷ {fmt(cpmNum)} CPM × 1,000 = campaign exhausts at {viewCeiling.toLocaleString()} total views
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setCreateStep(1)} className="flex-1 py-2.5 border border-border text-sm rounded hover:border-primary/30 transition-colors">← Back</button>
                        <button onClick={() => setCreateStep(3)} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-all">
                          Review & Pay →
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step 3 */}
                  {createStep === 3 && (
                    <>
                      <h3 className="font-semibold">Review & Pay</h3>
                      <div className="space-y-1">
                        {[
                          { label: "Campaign Name", value: form.name || "Untitled Campaign" },
                          { label: "Platforms", value: form.platforms.join(", ") || "None selected" },
                          { label: "CPM (gross)", value: fmt(cpmNum) },
                          { label: "Clipper CPM (80%)", value: fmt(Math.round(cpmNum * 0.8)) },
                          { label: "Total Budget", value: fmt(budgetNum) },
                          { label: "View Ceiling", value: viewCeiling.toLocaleString() + " views" },
                          { label: "Campaign End", value: form.end || "Not set" },
                        ].map((r) => (
                          <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                            <span className="text-xs text-muted-foreground">{r.label}</span>
                            <span className="text-sm font-mono font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle size={16} className="text-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-accent">
                          Full budget held in escrow until views are verified. Campaign goes live immediately after payment clears.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setCreateStep(2)} className="flex-1 py-2.5 border border-border text-sm rounded hover:border-primary/30 transition-colors">← Back</button>
                        <button
                          onClick={() => setPaidSuccess(true)}
                          className="flex-1 py-3 bg-accent text-accent-foreground text-sm font-black rounded hover:bg-accent/90 transition-all"
                        >
                          Pay {fmt(budgetNum)} via Paystack
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Billing */}
          {tab === "billing" && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-card border border-border rounded-xl p-5 space-y-1">
                <h3 className="text-sm font-semibold mb-3">Payment History</h3>
                {[
                  { date: "Jan 10, 2024", desc: "Burna Boy — City Boys Drop (Campaign funded)", amount: "₦300,000", status: "Paid" },
                  { date: "Dec 20, 2023", desc: "Falz x MTN Campaign (Campaign funded)", amount: "₦200,000", status: "Paid" },
                  { date: "Dec 01, 2023", desc: "Flutterwave Brand Push (Campaign funded)", amount: "₦500,000", status: "Paid" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm">{p.desc}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-mono font-bold text-sm text-accent" style={{ fontFamily: "'DM Mono', monospace" }}>{p.amount}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

type PendingClip = typeof PENDING_CLIPS[number] & { viewCount: string };

function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("pending");
  const [clips, setClips] = useState<PendingClip[]>(PENDING_CLIPS.map((c) => ({ ...c, viewCount: "" })));
  const [approvedClips, setApprovedClips] = useState<(typeof PENDING_CLIPS[number] & { viewsVerified: number })[]>([]);
  const [payoutStatus, setPayoutStatus] = useState<Record<number, string>>({});

  const approve = (id: number) => {
    const clip = clips.find((c) => c.id === id);
    if (!clip) return;
    const viewsVerified = parseInt(clip.viewCount) || 0;
    setApprovedClips((prev) => [...prev, { ...clip, viewsVerified }]);
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  const reject = (id: number) => setClips((prev) => prev.filter((c) => c.id !== id));

  const triggerPayout = (id: number) => setPayoutStatus((prev) => ({ ...prev, [id]: "Triggered" }));

  const adminTabs: { key: AdminTab; label: string }[] = [
    { key: "pending", label: "Pending Review" },
    { key: "approved", label: "Approved Clips" },
    { key: "all-campaigns", label: "All Campaigns" },
    { key: "payouts", label: "Payouts" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="border-b border-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            CLIP<span className="text-primary">NG</span>
          </span>
          <span className="text-xs font-mono bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded">ADMIN</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">{clips.length} pending</span>
        </div>
      </header>

      <div className="flex border-b border-border px-6 overflow-x-auto">
        {adminTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
            {t.key === "pending" && clips.length > 0 && (
              <span className="ml-2 text-xs bg-primary/15 text-primary border border-primary/20 rounded-full px-1.5 py-0.5">{clips.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">

        {/* Pending Review */}
        {tab === "pending" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Clips Awaiting Review</h3>
              {clips.length > 0 && (
                <button
                  onClick={() => clips.forEach((c) => approve(c.id))}
                  className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Approve All
                </button>
              )}
            </div>
            {clips.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                <CheckCircle size={32} className="mx-auto mb-3 text-primary/40" />
                <p className="text-sm">All clips reviewed. Nothing pending.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Clipper", "Campaign", "Platform", "Date", "Link", "Views (manual)", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clips.map((c) => (
                        <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 font-medium whitespace-nowrap">{c.clipper}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{c.campaign}</td>
                          <td className="px-4 py-3"><PlatformBadge p={c.platform} /></td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.date}</td>
                          <td className="px-4 py-3">
                            <a href={c.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                              Open <ExternalLink size={10} />
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              placeholder="0"
                              value={c.viewCount}
                              onChange={(e) => setClips((prev) => prev.map((cl) => cl.id === c.id ? { ...cl, viewCount: e.target.value } : cl))}
                              className="w-24 bg-input-background border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => approve(c.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap"
                              >
                                <CheckCircle size={10} /> Approve
                              </button>
                              <button
                                onClick={() => reject(c.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                              >
                                <XCircle size={10} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Approved Clips */}
        {tab === "approved" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Approved — Ready for Payout</h3>
            {approvedClips.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                <Clock size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm">Approved clips appear here after you review them in the Pending tab.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Clipper", "Campaign", "Views Verified", "Earnings Due (80%)", "Payout Status", "Action"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {approvedClips.map((c) => {
                        const campaign = CAMPAIGNS.find((ca) => ca.name === c.campaign);
                        const cpm = campaign?.cpm ?? 500;
                        const earnings = Math.round((c.viewsVerified / 1000) * cpm * 0.8);
                        const pStatus = payoutStatus[c.id] ?? "Pending";
                        return (
                          <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{c.clipper}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{c.campaign}</td>
                            <td className="px-4 py-3 font-mono text-xs">{c.viewsVerified.toLocaleString()}</td>
                            <td className="px-4 py-3 font-mono text-xs text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(earnings)}</td>
                            <td className="px-4 py-3"><StatusBadge status={pStatus} /></td>
                            <td className="px-4 py-3">
                              {pStatus === "Pending" ? (
                                <button
                                  onClick={() => triggerPayout(c.id)}
                                  className="px-3 py-1.5 text-xs bg-accent/10 text-accent border border-accent/20 rounded hover:bg-accent hover:text-accent-foreground transition-all font-medium whitespace-nowrap"
                                >
                                  Trigger Payout
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground font-mono">Done</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Campaigns */}
        {tab === "all-campaigns" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Campaign", "Funder", "CPM", "Budget", "Remaining", "Views", "Clips", "Status", "End Date"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CAMPAIGNS.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.funder}</td>
                      <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.cpm)}</td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.budget)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-accent whitespace-nowrap" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(c.remaining)}</td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{c.views.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs">{c.clips}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payouts */}
        {tab === "payouts" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Date", "Clipper", "Campaign", "Amount (₦)", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAYOUTS.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.date}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{p.clipper}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{p.campaign}</td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(p.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [signupRole, setSignupRole] = useState<AuthRole>("clipper");
  const [loginRole, setLoginRole] = useState<AuthRole>("clipper");

  const startSignup = (role: AuthRole) => {
    setSignupRole(role);
    setView("signup");
  };

  const onAuthSuccess = (role: AuthRole) => {
    setView(role);
  };

  const hideDemoPill = view === "login" || view === "signup";

  return (
    <div className="size-full relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Persistent view switcher pill — hidden on auth screens */}
      {!hideDemoPill && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-full px-2 py-1.5 shadow-2xl">
          {([
            { key: "landing", label: "Home" },
            { key: "login", label: "Login" },
            { key: "signup", label: "Signup" },
            { key: "clipper", label: "Clipper" },
            { key: "funder", label: "Funder" },
            { key: "admin", label: "Admin" },
          ] as { key: View; label: string }[]).map((v) => (
            <button
              key={v.key}
              onClick={() => {
                if (v.key === "login") setLoginRole("clipper");
                if (v.key === "signup") setSignupRole("clipper");
                setView(v.key);
              }}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${view === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {view === "landing" && <Landing onNavigate={setView} onStartSignup={startSignup} />}
      {view === "login" && (
        <Login
          key={loginRole}
          onNavigate={setView}
          onSuccess={onAuthSuccess}
          initialRole={loginRole}
        />
      )}
      {view === "signup" && (
        <Signup
          key={signupRole}
          onNavigate={setView}
          onSuccess={onAuthSuccess}
          initialRole={signupRole}
        />
      )}
      {view === "clipper" && <ClipperDashboard />}
      {view === "funder" && <FunderDashboard />}
      {view === "admin" && <AdminPanel />}
    </div>
  );
}
