"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Home,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import { generateBenefitText } from "@/service/renewal-flow";
import type { RenewalProposal } from "@/types/renewal-proposal";

interface TenantResponsePageProps {
  token: string;
}

interface ProposalData extends RenewalProposal {
  currentRent: number;
  currentDeposit: number;
  tenantName: string;
  endDate: string;
}

export function TenantResponsePage({ token }: TenantResponsePageProps) {
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantMessage, setTenantMessage] = useState("");
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);
  const [respondedAction, setRespondedAction] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/proposals/${token}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "제안서를 찾을 수 없습니다.");
        }
        const data = await res.json();
        setProposal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleRespond(action: "accept" | "reject" | "negotiate") {
    if (!proposal) return;
    setResponding(true);

    try {
      const res = await fetch(`/api/proposals/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          action,
          tenantMessage: tenantMessage || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "응답 처리에 실패했습니다.");
      }

      setRespondedAction(action);
      setResponded(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setResponding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600">{error ?? "제안서를 찾을 수 없습니다."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (responded) {
    const actionLabel =
      respondedAction === "accept"
        ? "수락"
        : respondedAction === "reject"
          ? "이사 준비"
          : "생각해보기";

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              응답이 전송되었습니다
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              임대인에게 회신이 전달되었습니다.
            </p>
            <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600">
              {actionLabel}
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadyResponded =
    proposal.status === "accepted" ||
    proposal.status === "rejected";

  const rentDiff = proposal.proposedRent - proposal.currentRent;
  const rentChangePct =
    proposal.currentRent > 0
      ? ((rentDiff / proposal.currentRent) * 100).toFixed(1)
      : "0";

  const benefitText = generateBenefitText(
    proposal.proposedRent,
    proposal.currentRent,
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4">
      <div className="max-w-lg mx-auto py-8 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#1B3A6B] flex items-center justify-center">
            <span className="text-white text-xs font-bold">RK</span>
          </div>
          <span className="text-sm text-slate-400">RentKeeper</span>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-black text-slate-800">
              갱신 제안서
            </h2>
            <p className="text-sm text-slate-400">
              {proposal.tenantName}님, 계약 만료일이 {proposal.endDate} 입니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comparison Section */}
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="p-4 bg-slate-50">
                  <p className="text-xs font-medium text-slate-400 mb-3">
                    현재 조건
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400">월세</p>
                      <p className="text-sm font-bold text-slate-700">
                        {proposal.currentRent.toLocaleString()}원
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">보증금</p>
                      <p className="text-sm font-bold text-slate-700">
                        {proposal.currentDeposit.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[#1B3A6B]/5 border-l border-slate-100">
                  <p className="text-xs font-medium text-[#1B3A6B] mb-3">
                    제안 조건
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400">월세</p>
                      <p className="text-sm font-bold text-slate-800">
                        {proposal.proposedRent.toLocaleString()}원
                        {rentDiff > 0 && (
                          <span className="text-xs text-amber-600 ml-1">
                            (+{rentChangePct}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">보증금</p>
                      <p className="text-sm font-bold text-slate-800">
                        {proposal.proposedDeposit.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">
                  갱신 시 혜택
                </span>
              </div>
              {benefitText.split("\n").map((line, i) => (
                <p key={i} className="text-sm text-emerald-700 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>

            {/* Landlord Message */}
            {proposal.message && (
              <div className="rounded-xl bg-white border border-slate-100 p-4">
                <p className="text-xs font-medium text-slate-400 mb-2">
                  임대인 메시지
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {proposal.message}
                </p>
              </div>
            )}

            {/* Already Responded */}
            {isAlreadyResponded ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">
                  이미 응답하셨습니다 (
                  {proposal.status === "accepted" ? "수락" : "거절"})
                </p>
              </div>
            ) : (
              <>
                {/* Response Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    회신 메시지 (선택)
                  </label>
                  <textarea
                    value={tenantMessage}
                    onChange={(e) => setTenantMessage(e.target.value)}
                    rows={3}
                    placeholder="임대인에게 전달할 메시지를 입력하세요"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] resize-none"
                  />
                </div>

                {/* 3 Response Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    disabled={responding}
                    onClick={() => handleRespond("accept")}
                  >
                    {responding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    갱신 수락
                  </Button>
                  <Button
                    className="w-full bg-[#1B3A6B] hover:bg-[#1B3A6B]/90 text-white gap-2"
                    disabled={responding}
                    onClick={() => handleRespond("negotiate")}
                  >
                    {responding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                    더 생각해볼게요
                  </Button>
                  <Button
                    className="w-full bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 gap-2"
                    disabled={responding}
                    onClick={() => handleRespond("reject")}
                  >
                    {responding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Home className="w-4 h-4" />
                    )}
                    이사 준비할게요
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-300 pt-4">
          본 제안서는 RentKeeper를 통해 발송되었습니다.
        </p>
      </div>
    </div>
  );
}
