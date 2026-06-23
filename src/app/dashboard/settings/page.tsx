"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Settings as SettingsType, DEFAULT_SETTINGS } from "@/types/settings";
import { Loader2, RotateCcw, Save, Thermometer, Droplets, Database, Clock, Shield, X, Lock } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { checkAdminAccess, verifyAdminKey, grantAdminAccess } from "@/lib/adminAccess";

export default function SettingsPage() {
  const { settings, isLoading } = useSettings();
  const { updateSettings } = useUpdateSettings();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [formData, setFormData] = useState<Partial<SettingsType>>({});
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (checkAdminAccess()) {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      setFormData(settings);
    }
  }, [settings]);

  const handleKeySubmit = () => {
    if (verifyAdminKey(keyInput)) {
      grantAdminAccess();
      setIsAuthorized(true);
      setKeyError("");
    } else {
      setKeyError("Kunci akses salah. Silakan coba lagi.");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Masukkan kunci akses untuk membuka Settings</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleKeySubmit()}
                  placeholder="Masukkan kunci akses..."
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                  autoFocus
                />
              </div>
              {keyError && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" /> {keyError}
                </p>
              )}
            </div>
            <button
              onClick={handleKeySubmit}
              disabled={!keyInput}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition active:scale-95 shadow-lg"
            >
              Buka Settings
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
            Hubungi engineer untuk mendapatkan kunci akses
          </p>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: "" }));
    } else {
      const parsed = name.includes("Retention") || name.includes("Interval")
        ? parseInt(value, 10)
        : parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: isNaN(parsed) ? "" : parsed }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      setToast({ type: "warning", message: "Please fix validation errors before saving" });
      return;
    }
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setToast({ type: "success", message: "Settings updated successfully!" });
    } catch {
      setToast({ type: "error", message: "Failed to update settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
    setErrors({});
    setToast({ type: "success", message: "Settings reset to default values" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-60 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} duration={3000} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure system thresholds and monitoring preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition active:scale-95">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-3">Current Threshold Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryItem label="Temperature Range" value={`${formData.thresholdTempMin ?? "-"}°C - ${formData.thresholdTempMax ?? "-"}°C`} icon={<Thermometer className="w-4 h-4 text-red-500" />} />
          <SummaryItem label="Humidity Range" value={`${formData.thresholdHumidityMin ?? "-"}% - ${formData.thresholdHumidityMax ?? "-"}%`} icon={<Droplets className="w-4 h-4 text-blue-500" />} />
          <SummaryItem label="Data Retention" value={`${formData.dataRetentionDays ?? "-"} days`} icon={<Database className="w-4 h-4 text-purple-500" />} />
          <SummaryItem label="Auto-refresh" value={`Every ${formData.monitoringIntervalSeconds ?? "-"}s`} icon={<Clock className="w-4 h-4 text-amber-500" />} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-500" /> Temperature & Humidity Thresholds
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Temperature Range (°C)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input type="number" step="0.1" name="thresholdTempMin" value={formData.thresholdTempMin ?? ""} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.thresholdTempMin ? "border-red-300 bg-red-50" : "border-slate-300 dark:border-slate-600"}`} />
                  <p className="text-xs text-slate-500 mt-1">Min</p>
                  {errors.thresholdTempMin && <p className="text-xs text-red-600 mt-0.5">{errors.thresholdTempMin}</p>}
                </div>
                <div>
                  <input type="number" step="0.1" name="thresholdTempMax" value={formData.thresholdTempMax ?? ""} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.thresholdTempMax ? "border-red-300 bg-red-50" : "border-slate-300 dark:border-slate-600"}`} />
                  <p className="text-xs text-slate-500 mt-1">Max</p>
                  {errors.thresholdTempMax && <p className="text-xs text-red-600 mt-0.5">{errors.thresholdTempMax}</p>}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Humidity Range (%)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input type="number" step="1" name="thresholdHumidityMin" value={formData.thresholdHumidityMin ?? ""} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.thresholdHumidityMin ? "border-red-300 bg-red-50" : "border-slate-300 dark:border-slate-600"}`} />
                  <p className="text-xs text-slate-500 mt-1">Min</p>
                  {errors.thresholdHumidityMin && <p className="text-xs text-red-600 mt-0.5">{errors.thresholdHumidityMin}</p>}
                </div>
                <div>
                  <input type="number" step="1" name="thresholdHumidityMax" value={formData.thresholdHumidityMax ?? ""} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.thresholdHumidityMax ? "border-red-300 bg-red-50" : "border-slate-300 dark:border-slate-600"}`} />
                  <p className="text-xs text-slate-500 mt-1">Max</p>
                  {errors.thresholdHumidityMax && <p className="text-xs text-red-600 mt-0.5">{errors.thresholdHumidityMax}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <span className="text-xs text-amber-800 dark:text-amber-400">⚠️ Changes to thresholds will affect chart reference lines and alert triggers</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500" /> Data Retention
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Days to Keep Historical Data</label>
              <input type="number" min="7" max="365" step="1" name="dataRetentionDays" value={formData.dataRetentionDays ?? ""} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.dataRetentionDays ? "border-red-300 bg-red-50" : "border-slate-300 dark:border-slate-600"}`} />
              {errors.dataRetentionDays ? <p className="text-xs text-red-600 mt-1">{errors.dataRetentionDays}</p> : <p className="text-xs text-slate-500 mt-1">Data older than this will be automatically cleaned (7-365 days)</p>}
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-xs text-blue-800 dark:text-blue-400">ℹ️ Currently set to keep {formData.dataRetentionDays ?? 90} days of data</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Auto-refresh Interval
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Refresh Interval (seconds)</label>
              <input type="number" min="5" max="3600" step="5" name="monitoringIntervalSeconds" value={formData.monitoringIntervalSeconds ?? ""} onChange={handleChange} className={`w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.monitoringIntervalSeconds ? "border-red-300 bg-red-50" : "border-slate-300 dark:border-slate-600"}`} />
              {errors.monitoringIntervalSeconds ? <p className="text-xs text-red-600 mt-1">{errors.monitoringIntervalSeconds}</p> : <p className="text-xs text-slate-500 mt-1">Dashboard and monitoring pages will refresh every {formData.monitoringIntervalSeconds ?? 5} seconds</p>}
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="text-xs text-green-800 dark:text-green-400">✓ Current refresh interval: {formData.monitoringIntervalSeconds ?? 5}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-900">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}
