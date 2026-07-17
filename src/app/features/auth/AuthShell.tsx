import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export function AuthShell({
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
