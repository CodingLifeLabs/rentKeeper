"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StatsCard } from "@/ui/components/dashboard/stats-card";
import { EmptyState } from "@/ui/components/dashboard/empty-state";
import { DashboardContractCard } from "@/ui/components/dashboard/dashboard-contract-card";
import { TodayActions } from "@/ui/components/dashboard/today-actions";
import type { Contract, ContractStatus } from "@/types/contract";

interface DashboardStats {
  total: number;
  active: number;
  expiring90: number;
  expiring30: number;
  negotiating: number;
  moveOutPending: number;
  vacant: number;
}

function computeStats(contracts: Contract[]): DashboardStats {
  const stats: DashboardStats = {
    total: contracts.length,
    active: 0,
    expiring90: 0,
    expiring30: 0,
    negotiating: 0,
    moveOutPending: 0,
    vacant: 0,
  };

  for (const contract of contracts) {
    switch (contract.status as ContractStatus) {
      case "active": stats.active++; break;
      case "expiring_90": stats.expiring90++; break;
      case "expiring_30": stats.expiring30++; break;
      case "negotiating": stats.negotiating++; break;
      case "move_out_pending": stats.moveOutPending++; break;
      case "vacant": stats.vacant++; break;
    }
  }

  return stats;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    expiring90: 0,
    expiring30: 0,
    negotiating: 0,
    moveOutPending: 0,
    vacant: 0,
  });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingProposal, setSendingProposal] = useState<string | null>(null);

  async function loadData() {
    try {
      const res = await fetch("/api/contracts");
      if (!res.ok) return;

      const data: Contract[] = await res.json();
      setContracts(data);
      setStats(computeStats(data));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendProposal(contract: Contract) {
    setSendingProposal(contract.id);

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          proposedRent: contract.monthlyRent ?? 0,
          proposedDeposit: contract.deposit,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "제안서 발송 실패");
      }

      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setSendingProposal(null);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800">계약 현황</h2>
        <p className="text-sm text-slate-500 mt-1">
          전체 세대 계약 상태 한눈에 보기
        </p>
      </div>

      {stats.total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatsCard label="전체 계약" value={stats.total} />
            <StatsCard
              label="계약 중"
              value={stats.active}
              color="text-[#00C896]"
              dotColor="bg-[#00C896]"
            />
            <StatsCard
              label="D-90 만기"
              value={stats.expiring90}
              color="text-[#FFB800]"
              dotColor="bg-[#FFB800]"
            />
            <StatsCard
              label="D-30 만기"
              value={stats.expiring30}
              color="text-[#FF4D4D]"
              dotColor="bg-[#FF4D4D]"
            />
            <StatsCard
              label="협상 중"
              value={stats.negotiating}
              color="text-[#8B5CF6]"
              dotColor="bg-[#8B5CF6]"
            />
            <StatsCard
              label="공실"
              value={stats.vacant}
              color="text-slate-400"
              dotColor="bg-slate-400"
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              오늘 해야 할 일
            </h3>
            <TodayActions />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              최근 계약 목록
            </h3>
            <div className="space-y-3">
              {contracts.map((contract) => (
                <DashboardContractCard
                  key={contract.id}
                  contract={contract}
                  onSendProposal={handleSendProposal}
                  proposalCount={
                    sendingProposal === contract.id ? 0 : undefined
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
