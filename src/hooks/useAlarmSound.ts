"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const MUTE_KEY = "cpems-alarm-muted";
const POLL_MS = 60000; // cek critical count tiap 60 detik
const BEEP_EVERY_MS = 4000; // ulangi beep tiap 4 detik selama critical aktif

// ── localStorage store (SSR-safe via useSyncExternalStore) ──
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function getMuted() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

/**
 * Alarm audio untuk alert CRITICAL.
 * - Beep sintetis (Web Audio, tanpa file).
 * - Berulang selama critical > 0, berhenti saat 0 (semua di-acknowledge).
 * - Mute persist di localStorage, di-toggle dari header.
 */
export function useAlarmSound() {
  const muted = useSyncExternalStore(subscribe, getMuted, () => false);
  const [criticalCount, setCriticalCount] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const beepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // ── Ensure AudioContext (dibuat lazy, di-resume setelah user gesture) ──
  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  // ── Satu tone beep (dua nada, urgen tapi tidak menyakitkan) ──
  const beep = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }, [ensureCtx]);

  // ── Unlock audio pada user gesture pertama (browser autoplay policy) ──
  useEffect(() => {
    const unlock = () => ensureCtx();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureCtx]);

  // ── Poll critical count ──
  useEffect(() => {
    let cancelled = false;
    const fetchCritical = async () => {
      try {
        const res = await fetch("/api/dashboard/alerts?summary=true");
        if (!res.ok) return;
        const { critical } = await res.json();
        if (!cancelled) setCriticalCount(typeof critical === "number" ? critical : 0);
      } catch {
        /* diam — jangan ganggu UI kalau poll gagal */
      }
    };
    fetchCritical();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchCritical();
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ── Loop beep selama critical > 0 dan tidak muted ──
  useEffect(() => {
    const shouldAlarm = criticalCount > 0 && !muted;
    if (shouldAlarm) {
      beep(); // bunyi langsung
      beepTimerRef.current = setInterval(() => {
        if (!mutedRef.current) beep();
      }, BEEP_EVERY_MS);
    }
    return () => {
      if (beepTimerRef.current) {
        clearInterval(beepTimerRef.current);
        beepTimerRef.current = null;
      }
    };
  }, [criticalCount, muted, beep]);

  const toggleMute = useCallback(() => {
    ensureCtx(); // klik toggle sekaligus unlock audio
    const next = !getMuted();
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    window.dispatchEvent(new Event("storage"));
  }, [ensureCtx]);

  return { criticalCount, muted, toggleMute, hasCritical: criticalCount > 0 };
}
