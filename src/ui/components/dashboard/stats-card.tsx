import { cn } from "@/config/utils";

interface StatsCardProps {
  label: string;
  value: number;
  color?: string;
  dotColor?: string;
  className?: string;
}

export function StatsCard({ label, value, color, dotColor, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {dotColor && (
          <span className={cn("w-2 h-2 rounded-full", dotColor)} />
        )}
        <div className="text-xs text-slate-400">{label}</div>
      </div>
      <div className={cn("text-3xl font-black", color ?? "text-slate-800")}>
        {value}
      </div>
    </div>
  );
}
