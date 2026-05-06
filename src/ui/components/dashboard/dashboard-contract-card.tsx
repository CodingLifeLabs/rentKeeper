"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent } from "@/ui/components/ui/card";
import type { Contract, ContractStatus } from "@/types/contract";
import type { ProposalStatus } from "@/types/renewal-proposal";

interface DashboardContractCardProps {
  contract: Contract;
  onSendProposal: (contract: Contract) => void;
  proposalCount?: number;
}

const statusConfig: Record<
  ContractStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: {
    label: "초안",
    color: "text-slate-400",
    bgColor: "bg-slate-50",
  },
  active: {
    label: "계약 중",
    color: "text-[#00C896]",
    bgColor: "bg-emerald-50",
  },
  expiring_90: {
    label: "D-90 만기",
    color: "text-[#FFB800]",
    bgColor: "bg-amber-50",
  },
  expiring_30: {
    label: "D-30 만기",
    color: "text-[#FF4D4D]",
    bgColor: "bg-red-50",
  },
  negotiating: {
    label: "협상 중",
    color: "text-[#8B5CF6]",
    bgColor: "bg-violet-50",
  },
  renewed: {
    label: "갱신 완료",
    color: "text-[#00C896]",
    bgColor: "bg-emerald-50",
  },
  move_out_pending: {
    label: "퇴거 예정",
    color: "text-orange-400",
    bgColor: "bg-orange-50",
  },
  vacant: {
    label: "공실",
    color: "text-slate-400",
    bgColor: "bg-slate-50",
  },
  archived: {
    label: "보관",
    color: "text-slate-400",
    bgColor: "bg-slate-50",
  },
};

const proposalStatusConfig: Record<
  ProposalStatus,
  { label: string; color: string }
> = {
  sent: { label: "대기 중", color: "text-[#FFB800]" },
  accepted: { label: "수락", color: "text-[#00C896]" },
  negotiating: { label: "협의 중", color: "text-[#8B5CF6]" },
  rejected: { label: "거절", color: "text-[#FF4D4D]" },
};

export function DashboardContractCard({
  contract,
  onSendProposal,
  proposalCount = 0,
}: DashboardContractCardProps) {
  const [sending, setSending] = useState(false);

  const status = statusConfig[contract.status] || statusConfig.draft;
  const canSendProposal =
    contract.status === "expiring_30" || contract.status === "negotiating";

  const handleSendProposal = () => {
    setSending(true);
    try {
      onSendProposal(contract);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
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
            <p className="text-xs text-slate-400">
              월세 {(contract.monthlyRent ?? 0).toLocaleString()}원
            </p>
            <p className="text-xs text-slate-400">
              만료일 {new Date(contract.endDate).toLocaleDateString("ko-KR")}
            </p>
            {proposalCount > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`text-xs font-medium ${proposalStatusConfig.sent.color}`}
                >
                  제안 {proposalCount}
                </span>
              </div>
            )}
          </div>

          {canSendProposal && (
            <Button
              size="sm"
              onClick={handleSendProposal}
              disabled={sending}
              variant="secondary"
              className="flex-shrink-0"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              제안서
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
