import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status?: "online" | "offline";
  isLoading?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon,
  status,
  isLoading = false 
}: StatCardProps) {
  const isOfflineAlert = status === "offline" && value !== "0" && value !== 0;
  
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
      isOfflineAlert ? "border-red-300 bg-red-50" : ""
    }`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 md:text-sm">{title}</p>

        <Icon 
          size={18} 
          className={`md:size-5 ${
            isOfflineAlert ? "text-red-600" : "text-slate-500"
          }`} 
        />
      </div>

      {isLoading ? (
        <div className="mt-3 h-8 w-20 bg-slate-200 rounded animate-pulse" />
      ) : (
        <h2 className={`mt-3 text-2xl font-bold md:text-3xl ${
          isOfflineAlert ? "text-red-700" : ""
        }`}>
          {value}
        </h2>
      )}
      
      {isOfflineAlert && !isLoading && (
        <p className="text-xs text-red-600 mt-1">⚠️ Ada device offline</p>
      )}
    </div>
  );
}
