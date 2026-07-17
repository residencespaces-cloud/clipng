"use client";

import type { ReactNode } from "react";
import { LogOut, Menu, Settings, X } from "lucide-react";
import { emitNavigationStart } from "@/app/lib/page-transition";
import { useAuth } from "@/app/lib/auth/auth-context";

export function DashboardShell<T extends string>({
  tab,
  items,
  user,
  sidebarOpen,
  onSidebarOpen,
  onSidebarClose,
  onTab,
  children,
  showSettings = false,
}: {
  tab: T;
  items: { key: T; label: string; icon: ReactNode }[];
  user: { name: string; roleLabel: string; accent: "primary" | "accent" };
  sidebarOpen: boolean;
  onSidebarOpen: () => void;
  onSidebarClose: () => void;
  onTab: (key: T) => void;
  children: ReactNode;
  showSettings?: boolean;
}) {
  const chip =
    user.accent === "primary"
      ? "bg-primary/10 border-primary/20"
      : "bg-accent/10 border-accent/20";
  const roleColor = user.accent === "primary" ? "text-primary" : "text-accent";
  const { logout } = useAuth();

  const handleLogout = async () => {
    onSidebarClose();
    emitNavigationStart();
    await logout();
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onSidebarClose} />
      )}

      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static z-40 flex flex-col w-56 bg-sidebar border-r border-sidebar-border h-full transition-transform duration-200`}>
        <div className="flex items-center justify-between px-5 h-14 border-b border-sidebar-border shrink-0">
          <span className="text-lg font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
            CLIP<span className="text-primary">NG</span>
          </span>
          <button className="lg:hidden text-muted-foreground" onClick={onSidebarClose}>
            <X size={18} />
          </button>
        </div>
        <div className="px-3 py-3 flex-1 overflow-y-auto">
          <div className={`px-3 py-2 border rounded-lg mb-4 ${chip}`}>
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold">{user.name}</p>
            <p className={`text-xs font-mono ${roleColor}`}>{user.roleLabel}</p>
          </div>
          <nav className="space-y-0.5">
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => onTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${tab === item.key ? "bg-primary/10 text-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3 pb-4 shrink-0 space-y-1.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted-foreground hover:text-red-400 hover:bg-sidebar-accent transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
          {showSettings && (
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
              <Settings size={16} /> Settings
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center gap-4 px-6 h-14 border-b border-border shrink-0">
          <button className="lg:hidden text-muted-foreground" onClick={onSidebarOpen}>
            <Menu size={18} />
          </button>
          <h2 className="text-sm font-semibold">{items.find((i) => i.key === tab)?.label}</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
