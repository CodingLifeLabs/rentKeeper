"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, FileText } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent } from "@/ui/components/ui/card";
import type { Contract, ContractStatus } from "@/types/contract";

const statusConfig: Record<
  ContractStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: "초안", color: "text-slate-400", bgColor: "bg-slate-50" },
  active: { label: "계약 중", color: "text-[#00C896]", bgColor: "bg-emerald-50" },
  expiring_90: { label: "D-90 만기", color: "text-[#FFB800]", bgColor: "bg-amber-50" },
  expiring_30: { label: "D-30 만기", color: "text-[#FF4D4D]", bgColor: "bg-red-50" },
  negotiating: { label: "협상 중", color: "text-[#8B5CF6]", bgColor: "bg-violet-50" },
  renewed: { label: "갱신 완료", color: "text-[#00C896]", bgColor: "bg-emerald-50" },
  move_out_pending: { label: "퇴거 예정", color: "text-orange-400", bgColor: "bg-orange-50" },
  vacant: { label: "공실", color: "text-slate-400", bgColor: "bg-slate-50" },
  archived: { label: "보관", color: "text-slate-400", bgColor: "bg-slate-50" },
};

const STATUS_FILTERS: { value: ContractStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "계약 중" },
  { value: "expiring_90", label: "D-90" },
  { value: "expiring_30", label: "D-30" },
  { value: "negotiating", label: "협상 중" },
  { value: "vacant", label: "공실" },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContractStatus | "all">("all");

  async function loadContracts() {
    try {
      const res = await fetch("/api/contracts");
      if (!res.ok) return;
      const data = await res.json();
      setContracts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContracts();
  }, []);

  const filtered =
    filter === "all"
      ? contracts
      : contracts.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">계약 관리</h2>
          <p className="text-sm text-slate-500 mt-1">
            전체 계약 목록 조회 및 관리
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="gap-1.5 bg-[#1A3C5E] hover:bg-[#1A3C5E]/90">
            <Plus size={16} />
            계약 등록
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === value
                ? "bg-[#1A3C5E] text-white"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 text-sm">
            {contracts.length === 0
              ? "등록된 계약이 없습니다. 첫 계약을 등록해보세요."
              : "해당 상태의 계약이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((contract) => {
            const status = statusConfig[contract.status] ?? statusConfig.draft;
            return (
              <Card key={contract.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-800 truncate">
                          {contract.tenantName}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {contract.contractType === "전세"
                          ? `보증금 ${contract.deposit.toLocaleString()}원`
                          : `보증금 ${contract.deposit.toLocaleString()}원 / 월세 ${(contract.monthlyRent ?? 0).toLocaleString()}원`}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(contract.startDate).toLocaleDateString("ko-KR")} ~{" "}
                        {new Date(contract.endDate).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
