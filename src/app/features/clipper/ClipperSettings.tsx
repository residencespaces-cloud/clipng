"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/app/lib/api/client";
import { useAuth } from "@/app/lib/auth/auth-context";
import { BankAccountFields, type BankAccountValue } from "@/app/components/shared/BankAccountFields";

export function ClipperSettings() {
  const { user, refreshUser } = useAuth();
  const [bankVerified, setBankVerified] = useState(false);
  const [bank, setBank] = useState<BankAccountValue>({
    bankCode: "",
    bankName: user?.bankName ?? "",
    accountNumber: user?.accountNumber ?? "",
    accountName: "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!bank.bankCode || bank.accountNumber.length !== 10) {
      toast.error("Select your bank and enter a 10-digit account number");
      return;
    }
    if (!bankVerified || !bank.accountName) {
      toast.error("Wait for Paystack to verify your account name");
      return;
    }
    setSaving(true);
    try {
      await api.profile.updateClipper({
        bankCode: bank.bankCode,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
      });
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
        <p className="text-xs text-muted-foreground mt-1">
          Select your bank and enter your account number. Paystack will confirm the account name for payouts.
        </p>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <BankAccountFields
          value={bank}
          onChange={setBank}
          onVerifiedChange={setBankVerified}
        />
        <button
          onClick={save}
          disabled={saving || !bankVerified}
          className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
}
