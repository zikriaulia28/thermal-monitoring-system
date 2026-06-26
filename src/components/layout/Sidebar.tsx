"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSystemStatus } from "@/hooks/useSystemStatus";

import {
  LayoutDashboard,
  Cpu,
  Activity,
  Bell,
  FileText,
  Settings,
  X,
  ChevronRight,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const menuGroups = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Devices", href: "/dashboard/devices", icon: Cpu },
      { name: "Monitoring", href: "/dashboard/monitoring", icon: Activity },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Alerts", href: "/dashboard/alerts", icon: Bell, showBadge: true },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    label: "SYSTEM",
    items: [{ name: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const [, setHoveredItem] = useState<string | null>(null);
  const { status } = useSystemStatus();

  return (
    <>
      {/* Backdrop untuk mobile */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen
          w-72
          bg-slate-950
          text-slate-300
          transition-transform
          duration-300 ease-out
          flex flex-col
          border-r border-slate-800

          ${open ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header dengan Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>

            {/* Brand Text */}
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                CPEMS
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Coolman Power
              </p>
            </div>
          </div>

          {/* Close Button - Mobile Only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 transition-colors active:scale-95"
            aria-label="Close sidebar"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {/* Group Label */}
              <div className="px-3 mb-2">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>

              {/* Menu Items */}
              <ul className="space-y-1">
                {group.items.map((menu) => {
                  const Icon = menu.icon;
                  const active = pathname === menu.href;
                  const badgeCount = menu.showBadge ? status.unacknowledgedAlerts : 0;

                  return (
                    <li key={menu.href}>
                      <Link
                        href={menu.href}
                        onClick={onClose}
                        onMouseEnter={() => setHoveredItem(menu.href)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`
                          group relative flex items-center gap-3
                          rounded-lg px-3 py-2.5
                          text-sm font-medium
                          transition-all duration-200
                          outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                          active:scale-95
                          
                          ${
                            active
                              ? "bg-blue-500/10 text-blue-400"
                              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                          }
                        `}
                        aria-current={active ? "page" : undefined}
                      >
                        {/* Active Indicator (Left Border) */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
                        )}

                        {/* Icon */}
                        <Icon
                          size={18}
                          className={`
                            transition-colors duration-200
                            ${active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}
                          `}
                        />

                        {/* Label */}
                        <span className="flex-1">{menu.name}</span>

                        {/* Badge untuk Alerts */}
                        {menu.showBadge && badgeCount > 0 && (
                          <span
                            className={`
                              inline-flex items-center justify-center
                              min-w-[20px] h-5 px-1.5
                              text-[10px] font-bold rounded-full
                              transition-all duration-200
                              animate-pulse
                              ${
                                active
                                  ? "bg-blue-500 text-white"
                                  : "bg-red-500/20 text-red-400 group-hover:bg-red-500/30"
                              }
                            `}
                          >
                            {badgeCount > 9 ? "9+" : badgeCount}
                          </span>
                        )}

                        {/* Chevron untuk active state */}
                        {active && (
                          <ChevronRight
                            size={14}
                            className="text-blue-400/50"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* System Status */}
        <div className="px-4 pb-4 space-y-3">
          {/* Device Status */}
          <div className="rounded-lg bg-slate-900/50 border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">
                Device Status
              </span>
              {status.onlineDevices > 0 ? (
                <Wifi size={14} className="text-green-500" />
              ) : (
                <WifiOff size={14} className="text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {status.onlineDevices > 0 && (
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
                  )}
                </div>
                <span className="text-slate-400">Online</span>
              </div>
              <span className="font-bold text-slate-200">
                {status.onlineDevices}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs mt-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-slate-400">Offline</span>
              </div>
              <span className="font-bold text-slate-200">
                {status.offlineDevices}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] text-slate-500">
                Total: {status.totalDevices} device{status.totalDevices !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Last Sync */}
          <div className="text-center">
            <div className="text-[10px] text-slate-600">
              Auto-refresh every 30s
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
