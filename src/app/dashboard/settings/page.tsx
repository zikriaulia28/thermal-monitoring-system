"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Settings as SettingsType, DEFAULT_SETTINGS } from "@/types/settings";
import {
  Loader2,
  RotateCcw,
  Save,
  Thermometer,
  Droplets,
  Database,
  Clock,
  Shield,
  X,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import {
  checkAdminAccess,
  verifyAdminKey,
  verifyServerSession,
} from "@/lib/adminAccess";
import Link from "next/link";

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-xs font-bold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  usePageTitle("Settings");
  const { settings, isLoading } = useSettings();
  const { updateSettings } = useUpdateSettings();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [rateLimitInfo, setRateLimitInfo] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [formData, setFormData] = useState<Partial<SettingsType>>({});
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Dual Validation: localStorage + Server ──────────────
  useEffect(() => {
    const validateAccess = async () => {
      if (checkAdminAccess()) {
        const serverValid = await verifyServerSession();
        if (serverValid) {
          setIsAuthorized(true);
        } else {
          localStorage.removeItem("cpems_admin");
        }
      }
      setIsChecking(false);
    };
    validateAccess();
  }, []);

  // ── Sync settings ke formData + cache ke sessionStorage ─
  const initializedRef = useRef(false);
  useEffect(() => {
    if (settings && !initializedRef.current) {
      initializedRef.current = true;
      setFormData(settings);
      try {
        sessionStorage.setItem("cpems_settings", JSON.stringify(settings));
      } catch {}
    }
  }, [settings]);

  // ── Cooldown Timer ──────────────────────────────────────
  const cooldownRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          setRateLimitInfo("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldownRemaining]);

  // ── Handle Password Submit ──────────────────────────────
  const handleKeySubmit = useCallback(async () => {
    setKeyError("");
    setRateLimitInfo("");

    try {
      const isValid = await verifyAdminKey(keyInput);
      if (isValid) {
        setIsAuthorized(true);
        setKeyError("");
      } else {
        setKeyError("Password salah. Silakan coba lagi.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Terlalu banyak")) {
        setRateLimitInfo(error.message);
        setCooldownRemaining(900);
      } else {
        setKeyError("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  }, [keyInput]);

  // ── Validation ──────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const tempMin = Number(formData.thresholdTempMin);
    const tempMax = Number(formData.thresholdTempMax);
    const humMin = Number(formData.thresholdHumidityMin);
    const humMax = Number(formData.thresholdHumidityMax);
    const retention = Number(formData.dataRetentionDays);
    const interval = Number(formData.monitoringIntervalSeconds);

    if (isNaN(tempMin) || isNaN(tempMax)) {
      newErrors.thresholdTempMin = "Valid temperature values required";
    } else if (tempMin >= tempMax) {
      newErrors.thresholdTempMin = "Min must be less than Max";
      newErrors.thresholdTempMax = "Max must be greater than Min";
    }
    if (isNaN(humMin) || isNaN(humMax)) {
      newErrors.thresholdHumidityMin = "Valid humidity values required";
    } else if (humMin >= humMax) {
      newErrors.thresholdHumidityMin = "Min must be less than Max";
      newErrors.thresholdHumidityMax = "Max must be greater than Min";
    }
    if (isNaN(retention) || retention < 7 || retention > 365) {
      newErrors.dataRetentionDays = "Must be between 7 and 365 days";
    }
    if (isNaN(interval) || interval < 5 || interval > 3600) {
      newErrors.monitoringIntervalSeconds = "Must be between 5 and 3600 seconds";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
      } else {
        const parsed =
          name.includes("Retention") || name.includes("Interval")
            ? parseInt(value, 10)
            : parseFloat(value);
        setFormData((prev) => ({ ...prev, [name]: isNaN(parsed) ? "" : parsed }));
      }
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  const handleSave = useCallback(async () => {
    if (!validate()) {
      setToast({
        type: "warning",
        message: "Perbaiki kesalahan validasi sebelum menyimpan",
      });
      return;
    }
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setToast({ type: "success", message: "Settings berhasil disimpan!" });
    } catch {
      setToast({
        type: "error",
        message: "Gagal menyimpan settings. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [validate, updateSettings, formData]);

  const handleReset = useCallback(() => {
    setFormData(DEFAULT_SETTINGS);
    setErrors({});
    setToast({ type: "success", message: "Settings di-reset ke default" });
  }, []);

  // ── Loading Screen (checking session) ───────────────────
  if (isChecking) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="h-8 w-40 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-60 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // ── Auth Gate ───────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="bg-card rounded-2xl shadow-sm p-8 w-full max-w-md mx-4 border border-border">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--cpems-warning)] flex items-center justify-center shadow-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Admin Access
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Masukkan password untuk membuka Settings
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    setKeyError("");
                    setRateLimitInfo("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !rateLimitInfo) handleKeySubmit();
                  }}
                  placeholder="Masukkan password admin..."
                  disabled={!!rateLimitInfo}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-input rounded-xl bg-card text-foreground focus:ring-2 focus:ring-[var(--cpems-warning)] focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus={!rateLimitInfo}
                />
              </div>
              {keyError && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" /> {keyError}
                </p>
              )}
              {rateLimitInfo && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {rateLimitInfo}
                  </p>
                  {cooldownRemaining > 0 && (
                    <p className="text-xs text-destructive mt-1 ml-4">
                      Tunggu {Math.floor(cooldownRemaining / 60)}:
                      {String(cooldownRemaining % 60).padStart(2, "0")}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleKeySubmit}
              disabled={!keyInput || !!rateLimitInfo}
              className="w-full py-3 bg-[var(--cpems-warning)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition active:scale-95 shadow-sm"
            >
              Buka Settings
            </button>
            <Link
              href="/dashboard"
              className="w-full py-3 border border-border text-foreground/80 font-medium rounded-xl hover:bg-muted transition active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Hubungi engineer untuk mendapatkan password admin
          </p>
        </div>
      </div>
    );
  }

  // ── Loading Settings ────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-60 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Settings Form ───────────────────────────────────────
  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Konfigurasi threshold dan preferensi monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-border text-foreground/80 font-medium rounded-lg hover:bg-muted transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition active:scale-95 shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      {/* Threshold Summary */}
      <div className="bg-muted border border-border rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Ringkasan Threshold
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryItem
            label="Suhu Normal"
            value={`${formData.thresholdTempMin ?? "-"}°C - ${formData.thresholdTempMax ?? "-"}°C`}
            icon={<Thermometer className="w-4 h-4 text-red-500" />}
          />
          <SummaryItem
            label="Kelembaban Normal"
            value={`${formData.thresholdHumidityMin ?? "-"}% - ${formData.thresholdHumidityMax ?? "-"}%`}
            icon={<Droplets className="w-4 h-4 text-blue-500" />}
          />
          <SummaryItem
            label="Retensi Data"
            value={`${formData.dataRetentionDays ?? "-"} hari`}
            icon={<Database className="w-4 h-4 text-purple-500" />}
          />
          <SummaryItem
            label="Auto-refresh"
            value={`Setiap ${formData.monitoringIntervalSeconds ?? "-"}d`}
            icon={<Clock className="w-4 h-4 text-amber-500" />}
          />
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Temperature & Humidity */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-500" /> Threshold Suhu & Kelembaban
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Rentang Suhu (°C)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    name="thresholdTempMin"
                    value={formData.thresholdTempMin ?? ""}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-[var(--primary)] outline-none transition ${
                      errors.thresholdTempMin
                        ? "border-destructive bg-destructive/10"
                        : "border-input"
                    }`}
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Min (°C)</p>
                  {errors.thresholdTempMin && (
                    <p className="text-xs text-red-600 mt-0.5">{errors.thresholdTempMin}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    name="thresholdTempMax"
                    value={formData.thresholdTempMax ?? ""}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-[var(--primary)] outline-none transition ${
                      errors.thresholdTempMax
                        ? "border-destructive bg-destructive/10"
                        : "border-input"
                    }`}
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Max (°C)</p>
                  {errors.thresholdTempMax && (
                    <p className="text-xs text-red-600 mt-0.5">{errors.thresholdTempMax}</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Rentang Kelembaban (%)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="1"
                    name="thresholdHumidityMin"
                    value={formData.thresholdHumidityMin ?? ""}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-[var(--primary)] outline-none transition ${
                      errors.thresholdHumidityMin
                        ? "border-destructive bg-destructive/10"
                        : "border-input"
                    }`}
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Min (%)</p>
                  {errors.thresholdHumidityMin && (
                    <p className="text-xs text-red-600 mt-0.5">{errors.thresholdHumidityMin}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    step="1"
                    name="thresholdHumidityMax"
                    value={formData.thresholdHumidityMax ?? ""}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-[var(--primary)] outline-none transition ${
                      errors.thresholdHumidityMax
                        ? "border-destructive bg-destructive/10"
                        : "border-input"
                    }`}
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Max (%)</p>
                  {errors.thresholdHumidityMax && (
                    <p className="text-xs text-red-600 mt-0.5">{errors.thresholdHumidityMax}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted border border-border rounded-lg">
              <span className="text-xs text-foreground/80">
                ⚠️ Perubahan threshold akan memengaruhi garis referensi chart dan trigger alert
              </span>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500" /> Retensi Data
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Hari Penyimpanan Data Historis
              </label>
              <input
                type="number"
                min="7"
                max="365"
                step="1"
                name="dataRetentionDays"
                value={formData.dataRetentionDays ?? ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-[var(--primary)] outline-none transition ${
                  errors.dataRetentionDays
                    ? "border-destructive bg-destructive/10"
                    : "border-input"
                }`}
              />
              {errors.dataRetentionDays ? (
                <p className="text-xs text-red-600 mt-1">{errors.dataRetentionDays}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Data lebih lama dari ini akan otomatis dibersihkan (7–365 hari)
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted border border-border rounded-lg">
              <span className="text-xs text-foreground/80">
                ℹ️ Saat ini menyimpan {formData.dataRetentionDays ?? 90} hari data
              </span>
            </div>


          </div>
        </div>

        {/* Auto-refresh Interval */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Interval Auto-refresh
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Interval Refresh (detik)
              </label>
              <input
                type="number"
                min="5"
                max="3600"
                step="5"
                name="monitoringIntervalSeconds"
                value={formData.monitoringIntervalSeconds ?? ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-[var(--primary)] outline-none transition ${
                  errors.monitoringIntervalSeconds
                    ? "border-destructive bg-destructive/10"
                    : "border-input"
                }`}
              />
              {errors.monitoringIntervalSeconds ? (
                <p className="text-xs text-red-600 mt-1">{errors.monitoringIntervalSeconds}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Dashboard & halaman monitoring akan refresh setiap{" "}
                  {formData.monitoringIntervalSeconds ?? 5} detik
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted border border-border rounded-lg">
              <span className="text-xs text-foreground/80">
                ✓ Interval refresh saat ini: {formData.monitoringIntervalSeconds ?? 5}d
              </span>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
