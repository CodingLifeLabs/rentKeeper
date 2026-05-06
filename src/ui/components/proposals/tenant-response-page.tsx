"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import type { RenewalProposal } from "@/types/renewal-proposal";

interface TenantResponsePageProps {
  token: string;
}

export function TenantResponsePage({ token }: TenantResponsePageProps) {
  const [proposal, setProposal] = useState<RenewalProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantMessage, setTenantMessage] = useState("");
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);

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
            <XCircle className="w-12 h-12 text-[#FF4D4D] mx-auto mb-4" />
            <p className="text-slate-600">{error ?? "제안서를 찾을 수 없습니다."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (responded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#00C896] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              응답이 전송되었습니다
            </h2>
            <p className="text-sm text-slate-400">
              임대인에게 회신이 전달되었습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadyResponded =
    proposal.status === "accepted" ||
    proposal.status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1A3C5E] flex items-center justify-center">
              <span className="text-white text-xs font-bold">RK</span>
            </div>
            <span className="text-sm text-slate-400">RentKeeper</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 mt-4">
            갱신 제안서
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-400">제안 월세</span>
              <span className="text-sm font-bold text-slate-800">
                {proposal.proposedRent.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-400">제안 보증금</span>
              <span className="text-sm font-bold text-slate-800">
                {proposal.proposedDeposit.toLocaleString()}원
              </span>
            </div>
            {proposal.message && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm text-slate-600">{proposal.message}</p>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-400">발송일</span>
              <span className="text-sm text-slate-600">
                {new Date(proposal.sentAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>

          {isAlreadyResponded ? (
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">
                이미 응답하셨습니다 ({proposal.status === "accepted" ? "수락" : "거절"})
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  회신 메시지 (선택)
                </label>
                <textarea
                  value={tenantMessage}
                  onChange={(e) => setTenantMessage(e.target.value)}
                  rows={3}
                  placeholder="임대인에게 전달할 메시지를 입력하세요"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1A3C5E] focus:outline-none focus:ring-1 focus:ring-[#1A3C5E] resize-none"
                />
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={responding}
                  onClick={() => handleRespond("accept")}
                >
                  {responding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  수락
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={responding}
                  onClick={() => handleRespond("negotiate")}
                >
                  <MessageSquare className="w-4 h-4" />
                  협의 요청
                </Button>
                <Button
                  className="w-full"
                  variant="danger"
                  disabled={responding}
                  onClick={() => handleRespond("reject")}
                >
                  <XCircle className="w-4 h-4" />
                  거절
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
