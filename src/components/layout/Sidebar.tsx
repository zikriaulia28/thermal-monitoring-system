"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSystemStatus } from "@/hooks/useSystemStatus";

import {
  LayoutDashboard,
  Cpu,
  Activity,
  Bell,
  FileText,
  Settings,
  X,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Devices", href: "/dashboard/devices", icon: Cpu },
  { name: "Monitoring", href: "/dashboard/monitoring", icon: Activity },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell, showBadge: true },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { status } = useSystemStatus();

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* ── Desktop: 64px icon-only / Mobile: full overlay ── */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          flex flex-col
          bg-sidebar text-sidebar-foreground
          border-r border-sidebar-border
          transition-transform duration-300 ease-out

          /* Mobile: w-72 overlay, closed by default */
          w-72
          ${open ? "translate-x-0" : "-translate-x-full"}

          /* Desktop: 64px always visible, icon-only */
          lg:w-16 lg:translate-x-0
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border lg:justify-center lg:px-0">
          <Link href="/dashboard" className="flex items-center gap-3 lg:gap-0" title="CPEMS — Coolman Power Environment Monitoring System">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--primary)] shadow-sm shrink-0">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div className="lg:hidden">
              <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">CPEMS</h1>
              <p className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-wider">Coolman Power</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent transition-colors active:scale-95"
            aria-label="Close sidebar"
          >
            <X size={18} className="text-sidebar-foreground/50" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 lg:px-0 lg:py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const badgeCount = item.showBadge ? status.unacknowledgedAlerts : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  relative flex items-center gap-3 lg:justify-center
                  rounded-lg px-3 py-2.5 lg:px-0 lg:py-2.5
                  text-sm font-medium
                  transition-all duration-200
                  outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
                  active:scale-95
                  group
                  ${active
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }
                `}
                aria-current={active ? "page" : undefined}
                title={item.name}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--primary)] rounded-r-full lg:left-auto lg:right-0 lg:h-6 lg:w-0.5" />
                )}

                <Icon
                  size={20}
                  className={`shrink-0 transition-colors duration-200 ${
                    active
                      ? "text-[var(--primary)]"
                      : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                  }`}
                />

                {/* Label — hidden on desktop */}
                <span className="flex-1 lg:hidden">{item.name}</span>

                {/* Badge — mobile only (desktop too small) */}
                {item.showBadge && badgeCount > 0 && (
                  <span className="lg:hidden inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full transition-all duration-200 bg-[var(--cpems-offline)]/15 text-[var(--cpems-offline)]">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}

                {/* Desktop dot indicator for alerts */}
                {item.showBadge && badgeCount > 0 && (
                  <span className="hidden lg:inline-block absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--cpems-offline)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── System Status — desktop: hidden, mobile: shown ── */}
        <div className="px-4 pb-4 space-y-3 lg:hidden">
          <div className="rounded-lg bg-sidebar-accent/50 border border-sidebar-border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-sidebar-foreground">Status Perangkat</span>
              <WifiIcon online={status.onlineDevices > 0} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <OnlineDot count={status.onlineDevices} />
              <span className="font-bold text-sidebar-foreground font-data">{status.onlineDevices}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <OfflineDot />
              <span className="font-bold text-sidebar-foreground font-data">{status.offlineDevices}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-sidebar-border">
              <div className="text-[10px] text-sidebar-foreground/40">
                Total: {status.totalDevices} device{status.totalDevices !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-sidebar-foreground/40">Auto-refresh setiap 30 detik</div>
          </div>
        </div>
      </aside>
    </>
  );
}

function WifiIcon({ online }: { online: boolean }) {
  return online
    ? <Wifi size={14} className="text-[var(--cpems-online)]" />
    : <WifiOff size={14} className="text-[var(--cpems-offline)]" />;
}

function OnlineDot({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-[var(--cpems-online)]" />
        {count > 0 && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--cpems-online)] animate-ping opacity-75" />
        )}
      </div>
      <span className="text-sidebar-foreground/60">Online</span>
    </div>
  );
}

function OfflineDot() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[var(--cpems-offline)]" />
      <span className="text-sidebar-foreground/60">Offline</span>
    </div>
  );
}
