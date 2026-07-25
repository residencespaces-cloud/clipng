"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { api } from "@/app/lib/api/client";
import { fmt } from "@/app/lib/format";

type SignupTokenRow = {
  id: string;
  code: string;
  createdFor: string;
  creditNaira: number;
  used: boolean;
  usedByEmail: string | null;
  usedAt: string | null;
  createdByEmail: string | null;
  createdAt: string;
};

export function SignupTokens() {
  const [tokens, setTokens] = useState<SignupTokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createdFor, setCreatedFor] = useState("");
  const [creditNaira, setCreditNaira] = useState("");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await api.admin.signupTokens.list();
      setTokens(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load tokens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async () => {
    const amount = Number(creditNaira);
    if (!createdFor.trim()) {
      toast.error("Enter who this token is for");
      return;
    }
    if (!Number.isFinite(amount) || amount < 100) {
      toast.error("Credit must be at least ₦100");
      return;
    }
    setCreating(true);
    try {
      const token = await api.admin.signupTokens.create({
        createdFor: createdFor.trim(),
        creditNaira: amount,
      });
      setLastCode(token.code);
      setCreatedFor("");
      setCreditNaira("");
      toast.success(`Token created: ${token.code}`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create token");
    } finally {
      setCreating(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  if (loading) {
    return <div className="bg-card border border-border rounded-xl p-12 animate-pulse h-48" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-sm font-semibold">Signup Tokens</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Generate single-use tokens that credit a funder wallet on signup. Optional for studios.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Created for</label>
            <input
              type="text"
              value={createdFor}
              onChange={(e) => setCreatedFor(e.target.value)}
              placeholder="Acme Content Studio"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Credit amount (₦)</label>
            <input
              type="number"
              min={100}
              step={100}
              value={creditNaira}
              onChange={(e) => setCreditNaira(e.target.value)}
              placeholder="50000"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>
        <button
          onClick={create}
          disabled={creating}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {creating ? "Generating…" : "Generate token"}
        </button>

        {lastCode && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
            <span className="text-xs text-muted-foreground">New code:</span>
            <code className="text-sm font-mono text-emerald-400 font-bold">{lastCode}</code>
            <button
              type="button"
              onClick={() => copyCode(lastCode)}
              className="ml-auto p-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Copy code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {tokens.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No tokens yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Code", "Created for", "Credit", "Status", "Used by", "Created"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => copyCode(t.code)}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {t.code}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs">{t.createdFor}</td>
                    <td className="px-4 py-3 font-mono text-xs">{fmt(t.creditNaira)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.used ? "Used" : "Available"} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.usedByEmail ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
