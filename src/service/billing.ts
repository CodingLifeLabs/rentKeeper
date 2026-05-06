import { Polar } from "@polar-sh/sdk";
import { getPlan, getPlanLimits, POLAR_ACCESS_TOKEN, POLAR_SERVER } from "@/config/plans";
import {
  getSubscriptionByLandlord,
  createSubscription,
  updateSubscription,
  getSubscriptionByPolarId,
  countContractsByLandlord,
} from "@/repo/subscription";
import { getLandlordByUserId } from "@/repo/landlord";
import type { PlanTier, Subscription, SubscriptionInsert } from "@/types/billing";

function createPolarClient(): Polar {
  return new Polar({
    accessToken: POLAR_ACCESS_TOKEN,
    server: POLAR_SERVER,
  });
}

export async function getCheckoutUrl(
  userId: string,
  tier: PlanTier,
): Promise<string> {
  const plan = getPlan(tier);
  if (!plan.polarProductId) {
    throw new Error(`Plan ${tier} does not support Polar checkout`);
  }

  const landlord = await getLandlordByUserId(userId);
  if (!landlord) {
    throw new Error("Landlord not found");
  }

  const polar = createPolarClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const checkout = await polar.checkouts.create({
    products: [plan.polarProductId],
    externalCustomerId: landlord.id,
    metadata: { landlordId: landlord.id, planTier: tier },
    successUrl: `${baseUrl}/billing/success?checkout_id={CHECKOUT_ID}`,
    returnUrl: `${baseUrl}/pricing`,
  });

  return checkout.url;
}

export async function getCurrentSubscription(
  landlordId: string,
): Promise<Subscription | null> {
  return getSubscriptionByLandlord(landlordId);
}

export async function getCurrentPlanTier(
  landlordId: string,
): Promise<PlanTier> {
  const subscription = await getSubscriptionByLandlord(landlordId);
  if (!subscription || subscription.status !== "active") {
    return "free";
  }
  return subscription.planTier;
}

export async function canPerformAction(
  landlordId: string,
  action: "create_contract" | "use_ocr" | "send_proposal" | "use_communication" | "use_branding",
): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getCurrentPlanTier(landlordId);
  const limits = getPlanLimits(tier);

  switch (action) {
    case "create_contract": {
      const count = await countContractsByLandlord(landlordId);
      if (count >= limits.maxContracts) {
        return {
          allowed: false,
          reason: `계약 등록 한도(${limits.maxContracts}건)에 도달했습니다. 플랜을 업그레이드해 주세요.`,
        };
      }
      return { allowed: true };
    }
    case "use_ocr":
      if (!limits.ocrEnabled) {
        return {
          allowed: false,
          reason: "OCR 기능은 Pro 이상 플랜에서 사용할 수 있습니다.",
        };
      }
      return { allowed: true };
    case "send_proposal":
      if (!limits.renewalProposals) {
        return {
          allowed: false,
          reason: "갱신 제안서 발송은 Pro 이상 플랜에서 사용할 수 있습니다.",
        };
      }
      return { allowed: true };
    case "use_communication":
      if (!limits.communicationHistory) {
        return {
          allowed: false,
          reason: "커뮤니케이션 이력은 Pro 이상 플랜에서 사용할 수 있습니다.",
        };
      }
      return { allowed: true };
    case "use_branding":
      if (!limits.customBranding) {
        return {
          allowed: false,
          reason: "커스텀 브랜딩은 Business 플랜에서 사용할 수 있습니다.",
        };
      }
      return { allowed: true };
  }
}

export async function handleWebhookEvent(
  payload: Record<string, unknown>,
): Promise<void> {
  const eventType = payload.type as string;
  const data = payload.data as Record<string, unknown>;

  if (!data) return;

  const polarSubscriptionId = data.id as string;
  const metadata = data.metadata as Record<string, string> | null;
  const landlordId = metadata?.landlordId;
  const planTier = metadata?.planTier as PlanTier | undefined;

  if (!landlordId || !planTier) return;

  switch (eventType) {
    case "subscription.active":
    case "subscription.created": {
      const existing = await getSubscriptionByLandlord(landlordId);
      if (existing) {
        await updateSubscription(existing.id, {
          planTier,
          status: "active",
          polarSubscriptionId,
          polarCustomerId: (data.customer as Record<string, unknown>)?.id as string | null,
          currentPeriodStart: (data.currentPeriodStart as Date)?.toISOString(),
          currentPeriodEnd: (data.currentPeriodEnd as Date)?.toISOString(),
        });
      } else {
        const input: SubscriptionInsert = {
          landlordId,
          planTier,
          polarSubscriptionId,
          polarCustomerId: (data.customer as Record<string, unknown>)?.id as string | null,
          status: "active",
          currentPeriodStart: (data.currentPeriodStart as Date)?.toISOString(),
          currentPeriodEnd: (data.currentPeriodEnd as Date)?.toISOString(),
        };
        await createSubscription(input);
      }
      break;
    }
    case "subscription.canceled": {
      const sub = await getSubscriptionByPolarId(polarSubscriptionId);
      if (sub) {
        await updateSubscription(sub.id, {
          status: "canceled",
          cancelAtPeriodEnd: true,
        });
      }
      break;
    }
    case "subscription.revoked": {
      const sub = await getSubscriptionByPolarId(polarSubscriptionId);
      if (sub) {
        await updateSubscription(sub.id, { status: "expired" });
      }
      break;
    }
    case "subscription.past_due": {
      const sub = await getSubscriptionByPolarId(polarSubscriptionId);
      if (sub) {
        await updateSubscription(sub.id, { status: "past_due" });
      }
      break;
    }
  }
}
