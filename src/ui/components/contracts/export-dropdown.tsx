"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Loader2 } from "lucide-react";

interface ExportDropdownProps {
  planTier: "free" | "pro" | "business";
}

const EXPORT_OPTIONS = [
  { type: "csv" as const, label: "CSV 다운로드", minTier: "free" as const },
  { type: "xlsx" as const, label: "Excel 다운로드", minTier: "pro" as const },
  { type: "zip" as const, label: "계약서 ZIP", minTier: "business" as const },
];

const TIER_ORDER: Record<string, number> = { free: 0, pro: 1, business: 2 };

function isAvailable(
  optionTier: string,
  userTier: string,
): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[optionTier];
}

export function ExportDropdown({ planTier }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleExport(
    type: "csv" | "xlsx" | "zip",
    e: React.MouseEvent,
  ) {
    e.stopPropagation();
    if (loading) return;

    setLoading(type);
    try {
      const res = await fetch(`/api/export/${type}?phone=true`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? "내보내기에 실패했습니다.");
        return;
      }

      if (type === "zip") {
        const body = await res.json();
        for (const file of body.files) {
          const link = document.createElement("a");
          link.href = file.url;
          link.download = file.name;
          link.click();
        }
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename\*=UTF-8''(.+)/);
      const filename = match
        ? decodeURIComponent(match[1])
        : `rentkeeper_export.${type}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        내보내기
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
          {EXPORT_OPTIONS.map((opt) => {
            const available = isAvailable(opt.minTier, planTier);
            const isLoading = loading === opt.type;

            return (
              <button
                key={opt.type}
                onClick={available ? (e) => handleExport(opt.type, e) : undefined}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                  available
                    ? "text-slate-700 hover:bg-slate-50"
                    : "text-slate-300 cursor-not-allowed"
                }`}
                disabled={!available || isLoading}
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {opt.label}
                {!available && (
                  <span className="ml-auto text-[10px] text-slate-400">
                    {opt.minTier === "pro" ? "PRO" : "BIZ"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
