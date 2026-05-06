"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent } from "@/ui/components/ui/card";
import { ProposalForm } from "@/ui/components/proposals/proposal-form";
import { CommunicationHistory } from "@/ui/components/proposals/communication-history";
import type { Contract } from "@/types/contract";
import type { RenewalProposal } from "@/types/renewal-proposal";

interface ProposalListPageProps {
  contract: Contract;
  onBack: () => void;
}

const statusLabel: Record<string, { text: string; color: string }> = {
  sent: { text: "대기 중", color: "text-[#FFB800] bg-amber-50" },
  accepted: { text: "수락", color: "text-[#00C896] bg-emerald-50" },
  negotiating: { text: "협의 중", color: "text-[#8B5CF6] bg-violet-50" },
  rejected: { text: "거절", color: "text-[#FF4D4D] bg-red-50" },
};

export function ProposalListPage({ contract, onBack }: ProposalListPageProps) {
  const [proposals, setProposals] = useState<RenewalProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals?contractId=${contract.id}`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data as RenewalProposal[]);
      }
    } finally {
      setLoading(false);
    }
  }, [contract.id]);

  useEffect(() => {
    void fetchProposals();
  }, [fetchProposals]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg p-1 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800">
            {contract.tenantName} — 갱신 제안서
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            월세 {(contract.monthlyRent ?? 0).toLocaleString()}원 · 만료일{" "}
            {new Date(contract.endDate).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {showForm ? (
        <ProposalForm
          contract={contract}
          onSubmitted={() => {
            setShowForm(false);
            void fetchProposals();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          갱신 제안서 발송
        </Button>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          불러오는 중...
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-slate-400">
            발송된 제안서가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const status = statusLabel[proposal.status] ?? {
              text: proposal.status,
              color: "text-slate-400 bg-slate-50",
            };
            return (
              <Card key={proposal.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        월세 {proposal.proposedRent.toLocaleString()}원
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      발송: {new Date(proposal.sentAt).toLocaleDateString("ko-KR")}
                      {proposal.respondedAt && (
                        <> · 응답: {new Date(proposal.respondedAt).toLocaleDateString("ko-KR")}</>
                      )}
                    </p>
                    {proposal.message && (
                      <p className="text-xs text-slate-500 mt-1">{proposal.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CommunicationHistory contractId={contract.id} />
    </div>
  );
}
