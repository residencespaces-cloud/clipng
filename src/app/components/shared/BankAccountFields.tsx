"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/app/lib/api/client";
import { Field } from "@/app/features/auth/Field";
import { inputClass } from "@/app/features/auth/inputClass";

export type BankAccountValue = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export function BankAccountFields({
  value,
  onChange,
  onVerifiedChange,
}: {
  value: BankAccountValue;
  onChange: (next: BankAccountValue) => void;
  onVerifiedChange?: (verified: boolean) => void;
}) {
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onVerifiedChangeRef = useRef(onVerifiedChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
    onVerifiedChangeRef.current = onVerifiedChange;
  }, [onChange, onVerifiedChange]);

  useEffect(() => {
    api.banks
      .list()
      .then(setBanks)
      .catch(() => setResolveError("Could not load banks. Refresh and try again."))
      .finally(() => setBanksLoading(false));
  }, []);

  const resolveAccount = useCallback(async (bankCode: string, accountNumber: string) => {
    const digits = accountNumber.replace(/\D/g, "");
    if (!bankCode || digits.length !== 10) {
      onChangeRef.current({ ...valueRef.current, accountName: "" });
      onVerifiedChangeRef.current?.(false);
      return;
    }
    setResolving(true);
    setResolveError("");
    try {
      const result = await api.banks.resolve(bankCode, digits);
      onChangeRef.current({
        ...valueRef.current,
        bankCode,
        accountNumber: result.accountNumber,
        accountName: result.accountName,
      });
      onVerifiedChangeRef.current?.(true);
    } catch (e) {
      onChangeRef.current({
        ...valueRef.current,
        bankCode,
        accountNumber: digits,
        accountName: "",
      });
      onVerifiedChangeRef.current?.(false);
      setResolveError(e instanceof Error ? e.message : "Could not verify account");
    } finally {
      setResolving(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const digits = value.accountNumber.replace(/\D/g, "");
    if (!value.bankCode || digits.length !== 10) {
      return;
    }
    debounceRef.current = setTimeout(() => {
      resolveAccount(value.bankCode, digits);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value.bankCode, value.accountNumber, resolveAccount]);

  const handleBankChange = (code: string) => {
    const bank = banks.find((b) => b.code === code);
    onChange({
      bankCode: code,
      bankName: bank?.name ?? "",
      accountNumber: value.accountNumber,
      accountName: "",
    });
    onVerifiedChange?.(false);
    setResolveError("");
  };

  const handleAccountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    onChange({
      ...value,
      accountNumber: digits,
      accountName: "",
    });
    onVerifiedChange?.(false);
    setResolveError("");
  };

  return (
    <div className="space-y-4">
      <Field label="Bank">
        <select
          value={value.bankCode}
          onChange={(e) => handleBankChange(e.target.value)}
          disabled={banksLoading}
          className={`${inputClass} ${!value.bankCode ? "text-muted-foreground" : ""}`}
        >
          <option value="">{banksLoading ? "Loading banks…" : "Select your bank"}</option>
          {banks.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Account number">
        <input
          type="text"
          inputMode="numeric"
          value={value.accountNumber}
          onChange={(e) => handleAccountChange(e.target.value)}
          placeholder="0123456789"
          maxLength={10}
          className={`${inputClass} font-mono`}
        />
      </Field>

      {resolving && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          Verifying account with Paystack…
        </div>
      )}

      {!resolving && value.accountName && (
        <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
          <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
          <span>
            Account name: <strong>{value.accountName}</strong>
          </span>
        </div>
      )}

      {resolveError && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          {resolveError}
        </div>
      )}
    </div>
  );
}
