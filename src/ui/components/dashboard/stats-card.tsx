import { cn } from "@/config/utils";

interface StatsCardProps {
  label: string;
  value: number;
  color?: string;
  className?: string;
}

export function StatsCard({ label, value, color, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5",
        className,
      )}
    >
      <div className="text-xs text-slate-400 mb-2">{label}</div>
      <div className={cn("text-3xl font-black", color ?? "text-slate-800")}>
        {value}
      </div>
    </div>
  );
}
