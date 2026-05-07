"use client";

import { useState } from "react";
import { Loader2, Send, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import { MESSAGE_GUIDELINES } from "@/types/renewal-flow";
import type { Contract } from "@/types/contract";

interface ProposalFormProps {
  contract: Contract;
  onSubmitted: () => void;
  onCancel: () => void;
}

type FormStep = "amounts" | "message" | "review";

export function ProposalForm({ contract, onSubmitted, onCancel }: ProposalFormProps) {
  const [proposedRent, setProposedRent] = useState(contract.monthlyRent ?? 0);
  const [proposedDeposit, setProposedDeposit] = useState(contract.deposit);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<FormStep>("amounts");

  const rentChange = contract.monthlyRent
    ? ((proposedRent - contract.monthlyRent) / contract.monthlyRent) * 100
    : 0;

  const isOverLimit = rentChange > 5;

  function nextStep() {
    if (step === "amounts") setStep("message");
    if (step === "message") setStep("review");
  }

  function prevStep() {
    if (step === "review") setStep("message");
    if (step === "message") setStep("amounts");
  }

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

  const steps: { key: FormStep; label: string }[] = [
    { key: "amounts", label: "조건 입력" },
    { key: "message", label: "메시지 작성" },
    { key: "review", label: "확인 및 발송" },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === step);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-bold text-slate-800">
          갱신 제안서 발송
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {contract.tenantName} — 현재 월세 {(contract.monthlyRent ?? 0).toLocaleString()}원
        </p>
        {/* Step Indicator */}
        <div className="flex items-center gap-1 mt-3">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStepIdx ? "bg-[#1B3A6B]" : "bg-slate-100"
                }`}
                style={{ minWidth: 60 }}
              />
              {i < steps.length - 1 && (
                <ChevronRight size={12} className="text-slate-300 shrink-0" />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          {steps.map((s) => (
            <span
              key={s.key}
              className={s.key === step ? "text-[#1B3A6B] font-medium" : ""}
            >
              {s.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Amounts */}
          {step === "amounts" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    제안 월세 (원)
                  </label>
                  <input
                    type="number"
                    value={proposedRent}
                    onChange={(e) => setProposedRent(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
                  />
                  {contract.monthlyRent && (
                    <p
                      className={`mt-1 text-xs ${
                        isOverLimit ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      인상율 {rentChange.toFixed(1)}%
                      {isOverLimit && " (법정 상한 5% 초과)"}
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
                  />
                </div>
              </div>

              {isOverLimit && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
                  월세 인상율이 5%를 초과합니다. 임차인이 거절할 가능성이 높습니다.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  취소
                </Button>
                <Button type="button" onClick={nextStep}>
                  다음 단계
                  <ChevronRight size={16} />
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Message with Guidelines */}
          {step === "message" && (
            <>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-800">
                    메시지 작성 팁
                  </span>
                </div>
                <ul className="space-y-1">
                  {MESSAGE_GUIDELINES.proposal.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-blue-700">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  메시지 (선택)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={MESSAGE_GUIDELINES.proposal.placeholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={prevStep}>
                  이전
                </Button>
                <Button type="button" onClick={nextStep}>
                  다음 단계
                  <ChevronRight size={16} />
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="p-4 bg-slate-50">
                    <p className="text-xs font-medium text-slate-400 mb-2">현재</p>
                    <p className="text-sm font-bold text-slate-700">
                      월세 {(contract.monthlyRent ?? 0).toLocaleString()}원
                    </p>
                    <p className="text-sm text-slate-500">
                      보증금 {contract.deposit.toLocaleString()}원
                    </p>
                  </div>
                  <div className="p-4 bg-[#1B3A6B]/5 border-l border-slate-100">
                    <p className="text-xs font-medium text-[#1B3A6B] mb-2">제안</p>
                    <p className="text-sm font-bold text-slate-800">
                      월세 {proposedRent.toLocaleString()}원
                    </p>
                    <p className="text-sm text-slate-500">
                      보증금 {proposedDeposit.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              {message && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-400 mb-1">메시지</p>
                  <p className="text-sm text-slate-600">{message}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={prevStep}>
                  이전
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  발송
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
