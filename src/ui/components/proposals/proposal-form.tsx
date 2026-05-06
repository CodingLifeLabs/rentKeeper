"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import type { Contract } from "@/types/contract";

interface ProposalFormProps {
  contract: Contract;
  onSubmitted: () => void;
  onCancel: () => void;
}

export function ProposalForm({ contract, onSubmitted, onCancel }: ProposalFormProps) {
  const [proposedRent, setProposedRent] = useState(
    contract.monthlyRent ?? 0,
  );
  const [proposedDeposit, setProposedDeposit] = useState(contract.deposit);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rentChange = contract.monthlyRent
    ? ((proposedRent - contract.monthlyRent) / contract.monthlyRent) * 100
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          proposedRent,
          proposedDeposit,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "발송 실패");
      }

      onSubmitted();
    } catch (err) {
      alert(err instanceof Error ? err.message : "발송 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-bold text-slate-800">
          갱신 제안서 발송
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {contract.tenantName} — 현재 월세 {(contract.monthlyRent ?? 0).toLocaleString()}원
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                제안 월세 (원)
              </label>
              <input
                type="number"
                value={proposedRent}
                onChange={(e) => setProposedRent(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1A3C5E] focus:outline-none focus:ring-1 focus:ring-[#1A3C5E]"
              />
              {contract.monthlyRent && (
                <p
                  className={`mt-1 text-xs ${
                    rentChange > 5 ? "text-[#FF4D4D]" : "text-slate-400"
                  }`}
                >
                  인상율 {rentChange.toFixed(1)}%
                  {rentChange > 5 && " (법정 상한 5% 초과)"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                제안 보증금 (원)
              </label>
              <input
                type="number"
                value={proposedDeposit}
                onChange={(e) => setProposedDeposit(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1A3C5E] focus:outline-none focus:ring-1 focus:ring-[#1A3C5E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              메시지 (선택)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="임차인에게 전달할 메시지를 입력하세요"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1A3C5E] focus:outline-none focus:ring-1 focus:ring-[#1A3C5E] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              발송
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
