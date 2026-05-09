"use client";

import { useState, useEffect } from "react";
import { Loader2, User, Bell, CreditCard, LogOut, FileText, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent } from "@/ui/components/ui/card";
import Link from "next/link";
import type { Landlord } from "@/types/landlord";
import type { AuditLog } from "@/types/audit-log";
import type { PlanTier, Subscription } from "@/types/billing";
import { formatAuditAction } from "@/service/audit-log";

const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

const PLAN_BADGE_COLORS: Record<PlanTier, string> = {
  free: "bg-slate-100 text-slate-500",
  pro: "bg-blue-50 text-blue-600",
  business: "bg-violet-50 text-violet-600",
};

export default function SettingsPage() {
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  async function loadProfile() {
    try {
      const res = await fetch("/api/landlord/profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data) setLandlord(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadBilling() {
    try {
      const res = await fetch("/api/billing");
      if (res.ok) {
        const data = await res.json() as { subscription: Subscription | null };
        setSubscription(data.subscription);
      }
    } catch {
      // Non-critical — best effort
    }
  }

  async function loadAuditLogs() {
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleOpenPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      if (!res.ok) {
        const { error } = await res.json() as { error?: string };
        alert(error ?? "포털 링크 생성에 실패했습니다.");
        return;
      }
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    } catch {
      alert("포털 링크 생성 중 오류가 발생했습니다.");
    } finally {
      setPortalLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async best-effort fetch, setState is guarded by res.ok
    loadBilling();
    loadAuditLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-black text-slate-800">설정</h2>
        <p className="text-sm text-slate-400 mt-1">
          프로필 및 계정 설정 관리
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#1B3A6B] flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {landlord?.name ?? "임대인"}
              </h3>
              <p className="text-xs text-slate-400">프로필 정보</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div>
                <p className="text-xs text-slate-400">이름</p>
                <p className="text-sm font-medium text-slate-700">
                  {landlord?.name ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div>
                <p className="text-xs text-slate-400">전화번호</p>
                <p className="text-sm font-medium text-slate-700">
                  {landlord?.phone ?? "등록되지 않음"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs text-slate-400">가입일</p>
                <p className="text-sm font-medium text-slate-700">
                  {landlord?.createdAt
                    ? new Date(landlord.createdAt).toLocaleDateString("ko-KR")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription / billing card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">구독 관리</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">현재 플랜</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    PLAN_BADGE_COLORS[subscription?.planTier ?? "free"]
                  }`}
                >
                  {subscription?.planTier !== "free" && (
                    <Zap size={10} className="shrink-0" />
                  )}
                  {PLAN_LABELS[subscription?.planTier ?? "free"]}
                </span>
                {subscription?.status === "past_due" && (
                  <span className="text-xs text-amber-500 font-medium">
                    결제 지연
                  </span>
                )}
                {subscription?.cancelAtPeriodEnd && (
                  <span className="text-xs text-slate-400">
                    (기간 만료 후 해지)
                  </span>
                )}
              </div>
            </div>
            {subscription?.currentPeriodEnd && (
              <div className="text-right">
                <p className="text-xs text-slate-400">갱신일</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "ko-KR",
                    { month: "short", day: "numeric" },
                  )}
                </p>
              </div>
            )}
          </div>

          {subscription && subscription.planTier !== "free" ? (
            <Button
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="w-full bg-[#1B3A6B] hover:bg-[#15305a] text-white text-sm"
            >
              {portalLoading ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : (
                <ExternalLink size={14} className="mr-2" />
              )}
              Polar 고객 포털 열기
            </Button>
          ) : (
            <Link href="/pricing">
              <Button className="w-full bg-[#1B3A6B] hover:bg-[#15305a] text-white text-sm">
                플랜 업그레이드
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">바로가기</h3>
          <div className="space-y-2">
            <Link
              href="/notifications"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Bell size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600">알림 설정</span>
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut size={16} className="text-red-400" />
                <span className="text-sm text-red-500">로그아웃</span>
              </button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">활동 이력</h3>
          </div>

          {logsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin text-slate-400" />
              <span className="text-xs text-slate-400">이력 로딩 중...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              아직 활동 이력이 없습니다
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {formatAuditAction(log.action)}
                    </p>
                    {log.targetId && (
                      <p className="text-xs text-slate-400">
                        ID: {log.targetId.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
