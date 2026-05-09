"use client";

import { useState } from "react";
import { getAllPlans } from "@/config/plans";
import { PricingCard } from "@/ui/components/pricing/pricing-card";
import type { PlanTier } from "@/types/billing";

interface PricingPageProps {
  currentPlan?: PlanTier;
}

export function PricingPage({ currentPlan }: PricingPageProps) {
  const plans = getAllPlans();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleSubscribe(tier: string) {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "결제 페이지 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900">요금제</h1>
        <p className="mt-3 text-slate-500">
          임대인 규모에 맞는 플랜을 선택하세요
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            key={plan.tier}
            plan={plan}
            current={plan.tier === currentPlan}
            onSubscribe={loading ? undefined : handleSubscribe}
          />
        ))}
      </div>

      {checkoutError && (
        <div className="mt-8 mx-auto max-w-lg rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-center">
          <p className="text-sm font-medium text-red-700">{checkoutError}</p>
        </div>
      )}
    </div>
  );
}
