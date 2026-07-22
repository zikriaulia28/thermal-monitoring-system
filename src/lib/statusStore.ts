"use client";

// ponytail: module singleton — satu interval + satu pasang fetch untuk seluruh app.
// Header & Sidebar (useSystemStatus) + useAlarmSound share state ini, jadi
// /api/dashboard/overview & /api/dashboard/alerts?summary=true masing-masing
// cuma di-hit 1x per poll (bukan 3-5x seperti sebelumnya). Asumsi single tab.

export interface DashboardStatus {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  unacknowledgedAlerts: number;
  critical: number;
  isLoading: boolean;
}

const POLL_MS = 60000; // 60s — jaga responsivitas alarm critical

const SSR_STATE: DashboardStatus = {
  totalDevices: 0,
  onlineDevices: 0,
  offlineDevices: 0,
  unacknowledgedAlerts: 0,
  critical: 0,
  isLoading: true,
};

let state: DashboardStatus = SSR_STATE;
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | null = null;
let refCount = 0;

function emit() {
  listeners.forEach((l) => l());
}

async function fetchStatus() {
  try {
    const [ovRes, alRes] = await Promise.all([
      fetch("/api/dashboard/overview"),
      fetch("/api/dashboard/alerts?summary=true"),
    ]);
    if (!ovRes.ok || !alRes.ok) return;
    const ov = await ovRes.json();
    const al = await alRes.json();
    state = {
      totalDevices: (ov.online ?? 0) + (ov.offline ?? 0),
      onlineDevices: ov.online ?? 0,
      offlineDevices: ov.offline ?? 0,
      unacknowledgedAlerts: typeof al.active === "number" ? al.active : 0,
      critical: typeof al.critical === "number" ? al.critical : 0,
      isLoading: false,
    };
    emit();
  } catch {
    /* diam — jangan ganggu UI kalau poll gagal */
  }
}

export function subscribeStatus(cb: () => void) {
  listeners.add(cb);
  refCount++;
  if (refCount === 1) {
    fetchStatus();
    interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchStatus();
    }, POLL_MS);
    window.addEventListener("alerts-changed", fetchStatus);
  }
  return () => {
    listeners.delete(cb);
    refCount--;
    if (refCount === 0 && interval) {
      clearInterval(interval);
      interval = null;
      window.removeEventListener("alerts-changed", fetchStatus);
    }
  };
}

export function getStatus(): DashboardStatus {
  return state;
}

export function getServerStatus(): DashboardStatus {
  return SSR_STATE;
}

// Trigger re-fetch instan (dipakai setelah acknowledge).
export function refreshStatus() {
  window.dispatchEvent(new Event("alerts-changed"));
}
