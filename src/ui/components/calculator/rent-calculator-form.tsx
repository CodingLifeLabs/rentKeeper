"use client";

import { useState } from "react";
import { Calculator, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/config/utils";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";
import type { RentCalculation } from "@/types/calculator";
import { calculateRent, calculateLegalMaxRent } from "@/service/rent-calculator";

export function RentCalculatorForm() {
  const [currentRent, setCurrentRent] = useState("");
  const [proposedRent, setProposedRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [result, setResult] = useState<RentCalculation | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const current = Number(currentRent);
    const proposed = Number(proposedRent);
    const dep = Number(deposit) || 0;

    if (current <= 0 || proposed <= 0) return;

    setResult(calculateRent(current, proposed, dep));
  };

  const legalMax = currentRent ? calculateLegalMaxRent(Number(currentRent)) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A3C5E] flex items-center justify-center">
              <Calculator size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">월세 인상 계산기</h3>
              <p className="text-sm text-slate-500">5% 상한 자동 계산 (주택임대차보호법)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-800">현재 월세 (원)</label>
                <input
                  type="number"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(e.target.value)}
                  placeholder="500000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-800">인상 요구 월세 (원)</label>
                <input
                  type="number"
                  value={proposedRent}
                  onChange={(e) => setProposedRent(e.target.value)}
                  placeholder="550000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-800">보증금 (원)</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="50000000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
                />
              </div>
            </div>

            {legalMax && (
              <div className="bg-[#1A3C5E]/5 rounded-xl px-4 py-3 text-sm text-[#1A3C5E]">
                법정 인상 상한: <span className="font-bold">{legalMax.toLocaleString()}원</span> (현재 월세의 5%)
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={!currentRent || !proposedRent}>
                계산하기
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className={cn(
              "rounded-xl p-5 space-y-4",
              result.isLegal ? "bg-[#00C896]/5 border border-[#00C896]/20" : "bg-[#FF4D4D]/5 border border-[#FF4D4D]/20",
            )}>
              <div className="flex items-center gap-2">
                {result.isLegal ? (
                  <CheckCircle2 size={20} className="text-[#00C896]" />
                ) : (
                  <AlertTriangle size={20} className="text-[#FF4D4D]" />
                )}
                <span className={cn("font-bold text-sm", result.isLegal ? "text-[#00C896]" : "text-[#FF4D4D]")}>
                  {result.isLegal ? "법정 기준 내 인상" : "법정 상한 초과"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-600 font-medium mb-1">현재 월세</div>
                  <div className="text-lg font-black text-slate-800">
                    {result.currentRent.toLocaleString()}원
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-medium mb-1">인상 후 월세</div>
                  <div className="text-lg font-black text-slate-800">
                    {result.proposedRent.toLocaleString()}원
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-medium mb-1">인상율</div>
                  <div className={cn(
                    "text-lg font-black",
                    result.isLegal ? "text-[#00C896]" : "text-[#FF4D4D]",
                  )}>
                    {(result.increaseRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-medium mb-1">법정 상한</div>
                  <div className="text-lg font-black text-slate-800">
                    {(result.legalMaxRate * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-slate-50 rounded-xl p-4">
              <Scale size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                {result.legalReference}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
