"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/app/lib/api/client";
import { useAuth } from "@/app/lib/auth/auth-context";

export function ClipperSettings() {
  const { user, refreshUser } = useAuth();
  const [bankName, setBankName] = useState(user?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!bankName.trim() || !accountNumber.trim()) {
      toast.error("Enter bank name and account number");
      return;
    }
    setSaving(true);
    try {
      await api.profile.updateClipper({ bankName: bankName.trim(), accountNumber: accountNumber.trim() });
      await refreshUser();
      toast.success("Bank details updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Bank Details</h3>
        <p className="text-xs text-muted-foreground mt-1">Used for Paystack payouts when your clips are verified.</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Bank Name</label>
          <input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. GTBank"
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Account Number</label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="0123456789"
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
}
