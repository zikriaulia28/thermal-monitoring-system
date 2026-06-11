import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 md:text-sm">{title}</p>

        <Icon size={18} className="text-slate-500 md:size-5" />
      </div>

      <h2 className="mt-3 text-2xl font-bold md:text-3xl">{value}</h2>
    </div>
  );
}
