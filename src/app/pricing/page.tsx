import Link from "next/link";
import { PricingPage } from "@/ui/components/pricing/pricing-page";
import { getAuthenticatedUser } from "@/service/auth";
import { getLandlordByUserId } from "@/repo/landlord";
import { getCurrentSubscription } from "@/service/billing";
import type { PlanTier } from "@/types/billing";

export default async function PricingRoute() {
  const user = await getAuthenticatedUser();
  let currentPlan: PlanTier = "free";

  if (user) {
    const landlord = await getLandlordByUserId(user.id);
    if (landlord) {
      const sub = await getCurrentSubscription(landlord.id);
      if (sub?.status === "active") currentPlan = sub.planTier;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-slate-900">
            렌트키퍼
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                대시보드
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </header>
      <PricingPage currentPlan={currentPlan} />
    </div>
  );
}
