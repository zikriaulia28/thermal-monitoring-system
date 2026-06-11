"use client";

import { useState } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Settings } from "@/types/settings";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { settings, isLoading } = useSettings();
  const { updateSettings } = useUpdateSettings();

  const [formData, setFormData] = useState<Partial<Settings>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when settings load
  if (settings && !formData.id) {
    setFormData(settings);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Retention") || name.includes("Interval") ? parseInt(value) : parseFloat(value),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setMessage({ type: "success", text: "Settings updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Configure system settings and thresholds
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Threshold Configuration */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            🌡️ Temperature & Humidity Thresholds
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Min Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="thresholdTempMin"
                  value={formData.thresholdTempMin || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Max Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="thresholdTempMax"
                  value={formData.thresholdTempMax || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Min Humidity (%)
                </label>
                <input
                  type="number"
                  step="1"
                  name="thresholdHumidityMin"
                  value={formData.thresholdHumidityMin || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Max Humidity (%)
                </label>
                <input
                  type="number"
                  step="1"
                  name="thresholdHumidityMax"
                  value={formData.thresholdHumidityMax || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
              ℹ️ Alert will be triggered when readings exceed these thresholds
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            💾 Data Retention
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Days to Keep Data
              </label>
              <input
                type="number"
                min="7"
                max="365"
                step="1"
                name="dataRetentionDays"
                value={formData.dataRetentionDays || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
              ℹ️ Data older than {formData.dataRetentionDays} days will be auto-deleted (coming soon)
            </p>
          </div>
        </div>

        {/* Monitoring Interval */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            ⏱️ Monitoring Interval
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Auto-refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="3600"
                step="1"
                name="monitoringIntervalSeconds"
                value={formData.monitoringIntervalSeconds || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
              ℹ️ Dashboard will refresh data every {formData.monitoringIntervalSeconds} seconds
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2 transition"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
