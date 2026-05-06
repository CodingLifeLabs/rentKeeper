import type { Plan } from "@/types/billing";

interface PricingCardProps {
  plan: Plan;
  current?: boolean;
  onSubscribe?: (tier: string) => void;
}

export function PricingCard({ plan, current, onSubscribe }: PricingCardProps) {
  const isPopular = plan.tier === "pro";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
        isPopular
          ? "border-blue-600 shadow-lg shadow-blue-600/10 scale-[1.02]"
          : "border-slate-200 shadow-sm"
      } ${current ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
          가장 인기
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-slate-900">
          {plan.price === 0 ? "무료" : `₩${plan.price.toLocaleString()}`}
        </span>
        {plan.price > 0 && (
          <span className="text-sm text-slate-500">/월</span>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {current ? (
        <div className="rounded-lg border border-slate-200 py-3 text-center text-sm font-medium text-slate-500">
          현재 플랜
        </div>
      ) : (
        <button
          onClick={() => onSubscribe?.(plan.tier)}
          disabled={plan.tier === "free"}
          className={`rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
            plan.tier === "free"
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : isPopular
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {plan.tier === "free" ? "기본 제공" : "구독하기"}
        </button>
      )}
    </div>
  );
}
