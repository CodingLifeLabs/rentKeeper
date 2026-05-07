"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, Phone, Loader2 } from "lucide-react";
import type { TodayAction } from "@/types/audit-log";

const URGENCY_STYLES = {
  high: {
    bg: "bg-red-50",
    border: "border-red-100",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
} as const;

function ActionIcon({ type }: { type: TodayAction["type"] }) {
  switch (type) {
    case "expiring_soon":
      return <AlertTriangle size={18} />;
    case "no_response":
      return <Clock size={18} />;
    case "renewal_contact":
      return <Phone size={18} />;
  }
}

export function TodayActions() {
  const [actions, setActions] = useState<TodayAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/today-actions");
        if (res.ok) {
          const data = await res.json();
          setActions(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 size={16} className="animate-spin text-slate-400" />
        <span className="text-sm text-slate-400">오늘 할 일 로딩 중...</span>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
        <p className="text-sm text-emerald-700 font-medium">
          오늘은 할 일이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => {
        const style = URGENCY_STYLES[action.urgency];
        return (
          <div
            key={action.id}
            className={`rounded-xl ${style.bg} border ${style.border} p-4 flex items-start gap-3`}
          >
            <div className={`${style.icon} mt-0.5 shrink-0`}>
              <ActionIcon type={action.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {action.label}
                </span>
                {action.daysUntil != null && (
                  <span className="text-xs text-slate-400">D-{action.daysUntil}</span>
                )}
                {action.daysSinceSent != null && (
                  <span className="text-xs text-slate-400">{action.daysSinceSent}일 경과</span>
                )}
              </div>
              <p className="text-sm text-slate-700">{action.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
