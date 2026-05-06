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

  return <PricingPage currentPlan={currentPlan} />;
}
