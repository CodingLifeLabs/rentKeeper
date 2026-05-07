"use client";

import { useState, useEffect } from "react";
import { Loader2, User, Bell, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent } from "@/ui/components/ui/card";
import Link from "next/link";
import type { Landlord } from "@/types/landlord";

export default function SettingsPage() {
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadProfile();
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
            <div className="w-12 h-12 rounded-full bg-[#1A3C5E] flex items-center justify-center">
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
            <Link
              href="/billing/success"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <CreditCard size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600">구독 관리</span>
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
    </div>
  );
}
