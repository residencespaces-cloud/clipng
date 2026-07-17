import { Building2, Film } from "lucide-react";
import type { AuthRole } from "@/app/types";

export function RolePicker({
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
