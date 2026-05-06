"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/ui/components/ui/card";
import { ProposalListPage } from "@/ui/components/proposals/proposal-list-page";
import type { Contract } from "@/types/contract";

export default function ProposalsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );

  async function loadContracts() {
    try {
      const res = await fetch("/api/contracts");
      if (res.ok) {
        const data = await res.json();
        const expiring = (data as Contract[]).filter(
          (c) =>
            c.status === "expiring_90" ||
            c.status === "expiring_30" ||
            c.status === "negotiating",
        );
        setContracts(expiring);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selectedContract) {
    return (
      <ProposalListPage
        contract={selectedContract}
        onBack={() => setSelectedContract(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800">갱신 제안서</h2>
        <p className="text-sm text-slate-400 mt-1">
          만기 임박 계약의 갱신 제안서 관리
        </p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          불러오는 중...
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-slate-400">
            만기 임박 계약이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <button
              key={contract.id}
              onClick={() => setSelectedContract(contract)}
              className="w-full text-left"
            >
              <Card className="hover:border-[#1A3C5E]/20 transition-colors">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {contract.tenantName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          contract.status === "negotiating"
                            ? "text-[#8B5CF6] bg-violet-50"
                            : contract.status === "expiring_30"
                              ? "text-[#FF4D4D] bg-red-50"
                              : "text-[#FFB800] bg-amber-50"
                        }`}
                      >
                        {contract.status === "negotiating"
                          ? "협상 중"
                          : contract.status === "expiring_30"
                            ? "D-30 만기"
                            : "D-90 만기"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      월세 {(contract.monthlyRent ?? 0).toLocaleString()}원 · 만료일{" "}
                      {new Date(contract.endDate).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-slate-300" />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
