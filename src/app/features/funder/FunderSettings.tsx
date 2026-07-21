"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/app/lib/api/client";
import { useAuth } from "@/app/lib/auth/auth-context";

export function FunderSettings() {
  const { user, refreshUser } = useAuth();
  const [businessName, setBusinessName] = useState(user?.businessName ?? user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    setSaving(true);
    try {
      await api.profile.updateFunder({ businessName: businessName.trim(), phone: phone.trim() });
      await refreshUser();
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Business Profile</h3>
        <p className="text-xs text-muted-foreground mt-1">Update your brand details shown to clippers.</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Business / Brand Name</label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 bg-accent text-accent-foreground text-sm font-bold rounded hover:bg-accent/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
