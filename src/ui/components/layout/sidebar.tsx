"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/config/utils";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  Calculator,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/contracts", label: "계약관리", icon: FileText },
  { href: "/calculator", label: "월세계산기", icon: Calculator },
  { href: "/notifications", label: "알림설정", icon: Bell },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-100 bg-white min-h-screen">
      <div className="p-6 border-b border-slate-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-black text-[#1A3C5E] tracking-tight">RentKeeper</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00C896] text-white font-bold">
            렌트키퍼
          </span>
        </Link>
      </div>
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-[#1A3C5E]/5 text-[#1A3C5E] font-semibold"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
