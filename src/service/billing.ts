import type { validateEvent } from "@polar-sh/sdk/webhooks";
import { Polar } from "@polar-sh/sdk";
import {
  getPlan,
  getPlanLimits,
  getTierByProductId,
  POLAR_ACCESS_TOKEN,
  POLAR_SERVER,
} from "@/config/plans";
import {
  getSubscriptionByLandlord,
  createSubscription,
  updateSubscription,
  getSubscriptionByPolarId,
  countContractsByLandlord,
  getAllSubscriptionsForSync,
} from "@/repo/subscription";
import { createAdminSupabaseClient } from "@/repo/supabase-admin";
import { getLandlordByUserId, getLandlordById } from "@/repo/landlord";
import { createAuditLog } from "@/repo/audit-log";
import type {
  PlanTier,
  Subscription,
  SubscriptionInsert,
  SubscriptionStatus,
} from "@/types/billing";

type WebhookEvent = ReturnType<typeof validateEvent>;

const GRACE_PERIOD_DAYS = 14;

function createPolarClient(): Polar {
  return new Polar({
    accessToken: POLAR_ACCESS_TOKEN,
    server: POLAR_SERVER,
  });
}

function toLocalStatus(polarStatus: string): SubscriptionStatus {
  switch (polarStatus) {
    case "active":
    case "trialing":
    case "incomplete":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "expired";
  }
}

function graceEndAt(daysFromNow = GRACE_PERIOD_DAYS): string {
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.NODE_ENV === "production" && !baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is required in production");
  }
  const resolvedBaseUrl = baseUrl ?? "http://localhost:3000";

  const polar = createPolarClient();
  const checkout = await polar.checkouts.create({
    products: [plan.polarProductId],
    externalCustomerId: landlord.id,
    metadata: { landlordId: landlord.id },
    successUrl: `${resolvedBaseUrl}/billing/success?checkout_id={CHECKOUT_ID}`,
    returnUrl: `${resolvedBaseUrl}/pricing`,
  });

  // Best-effort audit — do not let log failure abort checkout
  try {
    await createAuditLog({ landlordId: landlord.id, action: "checkout_initiated", metadata: { tier } });
  } catch {
    // non-critical
  }

  return checkout.url;
}

export async function getCustomerPortalUrl(landlordId: string): Promise<string> {
  const subscription = await getSubscriptionByLandlord(landlordId);
  if (!subscription?.polarCustomerId) {
    throw new Error("No active Polar subscription found");
  }

  const polar = createPolarClient();
  const session = await polar.customerSessions.create({
    customerId: subscription.polarCustomerId,
  });

  return session.customerPortalUrl;
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
  if (!subscription) return "free";
  if (
    subscription.status === "active" ||
    subscription.status === "past_due"
  ) {
    return subscription.planTier;
  }
  return "free";
}

export async function canPerformAction(
  landlordId: string,
  action:
    | "create_contract"
    | "use_ocr"
    | "send_proposal"
    | "use_communication"
    | "use_branding",
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

export async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  const admin = createAdminSupabaseClient();

  switch (event.type) {
    case "subscription.created": {
      const sub = event.data;
      const tier = getTierByProductId(sub.productId);
      if (!tier) return;

      const landlordId = sub.metadata["landlordId"] as string | undefined;
      if (!landlordId) return;

      const landlord = await getLandlordById(landlordId, admin);
      if (!landlord) return;

      const existing = await getSubscriptionByLandlord(landlordId, admin);
      if (existing) {
        await updateSubscription(
          existing.id,
          {
            planTier: tier,
            status: toLocalStatus(sub.status),
            polarSubscriptionId: sub.id,
            polarCustomerId: sub.customerId,
            currentPeriodStart: sub.currentPeriodStart.toISOString(),
            currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            graceEndAt: null,
          },
          admin,
        );
      } else {
        const input: SubscriptionInsert = {
          landlordId,
          planTier: tier,
          polarSubscriptionId: sub.id,
          polarCustomerId: sub.customerId,
          status: toLocalStatus(sub.status),
          currentPeriodStart: sub.currentPeriodStart.toISOString(),
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        };
        await createSubscription(input, admin);
      }
      try {
        await createAuditLog(
          { landlordId, action: "subscription_activated", metadata: { tier, polarSubscriptionId: sub.id } },
          admin,
        );
      } catch { /* non-critical */ }
      break;
    }

    case "subscription.active": {
      const sub = event.data;
      const tier = getTierByProductId(sub.productId);
      if (!tier) return;

      const landlordId = sub.metadata["landlordId"] as string | undefined;
      if (!landlordId) return;

      const landlord = await getLandlordById(landlordId, admin);
      if (!landlord) return;

      const existing = await getSubscriptionByPolarId(sub.id, admin)
        ?? await getSubscriptionByLandlord(landlordId, admin);

      if (existing) {
        await updateSubscription(
          existing.id,
          {
            planTier: tier,
            status: "active",
            polarSubscriptionId: sub.id,
            polarCustomerId: sub.customerId,
            currentPeriodStart: sub.currentPeriodStart.toISOString(),
            currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            graceEndAt: null,
          },
          admin,
        );
      } else {
        const input: SubscriptionInsert = {
          landlordId,
          planTier: tier,
          polarSubscriptionId: sub.id,
          polarCustomerId: sub.customerId,
          status: "active",
          currentPeriodStart: sub.currentPeriodStart.toISOString(),
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        };
        await createSubscription(input, admin);
      }
      try {
        await createAuditLog(
          { landlordId, action: "subscription_activated", metadata: { tier, polarSubscriptionId: sub.id } },
          admin,
        );
      } catch { /* non-critical */ }
      break;
    }

    case "subscription.updated": {
      const sub = event.data;
      const existing = await getSubscriptionByPolarId(sub.id, admin);
      if (!existing) return;

      const tier = getTierByProductId(sub.productId);
      await updateSubscription(
        existing.id,
        {
          ...(tier ? { planTier: tier } : {}),
          status: toLocalStatus(sub.status),
          currentPeriodStart: sub.currentPeriodStart.toISOString(),
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        },
        admin,
      );
      try {
        await createAuditLog(
          { landlordId: existing.landlordId, action: "subscription_updated", metadata: { tier, polarSubscriptionId: sub.id } },
          admin,
        );
      } catch { /* non-critical */ }
      break;
    }

    case "subscription.uncanceled": {
      const sub = event.data;
      const existing = await getSubscriptionByPolarId(sub.id, admin);
      if (!existing) return;
      await updateSubscription(
        existing.id,
        { status: "active", cancelAtPeriodEnd: false, graceEndAt: null },
        admin,
      );
      break;
    }

    case "subscription.canceled": {
      const sub = event.data;
      const existing = await getSubscriptionByPolarId(sub.id, admin);
      if (!existing) return;
      await updateSubscription(
        existing.id,
        { status: "canceled", cancelAtPeriodEnd: true },
        admin,
      );
      try {
        await createAuditLog(
          { landlordId: existing.landlordId, action: "subscription_canceled", metadata: { polarSubscriptionId: sub.id } },
          admin,
        );
      } catch { /* non-critical */ }
      break;
    }

    case "subscription.revoked": {
      const sub = event.data;
      const existing = await getSubscriptionByPolarId(sub.id, admin);
      if (!existing) return;
      await updateSubscription(
        existing.id,
        { status: "expired", graceEndAt: graceEndAt() },
        admin,
      );
      try {
        await createAuditLog(
          { landlordId: existing.landlordId, action: "subscription_expired", metadata: { polarSubscriptionId: sub.id } },
          admin,
        );
      } catch { /* non-critical */ }
      break;
    }

    case "subscription.past_due": {
      const sub = event.data;
      const existing = await getSubscriptionByPolarId(sub.id, admin);
      if (!existing) return;
      await updateSubscription(existing.id, { status: "past_due" }, admin);
      try {
        await createAuditLog(
          { landlordId: existing.landlordId, action: "subscription_past_due", metadata: { polarSubscriptionId: sub.id } },
          admin,
        );
      } catch { /* non-critical */ }
      break;
    }

    case "order.refunded": {
      const order = event.data;
      // one-time purchases have no subscriptionId — nothing to update
      if (!order.subscriptionId) return;
      const existing = await getSubscriptionByPolarId(order.subscriptionId, admin);
      if (!existing) return;
      // Immediate downgrade: mark refunded + reset to free tier, no grace window
      await updateSubscription(
        existing.id,
        { status: "refunded", planTier: "free", graceEndAt: null },
        admin,
      );
      try {
        await createAuditLog(
          { landlordId: existing.landlordId, action: "subscription_refunded", metadata: { orderId: order.id } },
          admin,
        );
      } catch { /* non-critical */ }
      break;
    }
  }
}

export async function syncSubscriptionsWithPolar(): Promise<{
  checked: number;
  updated: number;
}> {
  const admin = createAdminSupabaseClient();
  const polar = createPolarClient();
  const subscriptions = await getAllSubscriptionsForSync(admin);

  let updated = 0;
  for (const sub of subscriptions) {
    if (!sub.polarSubscriptionId) continue;
    try {
      const polarSub = await polar.subscriptions.get({ id: sub.polarSubscriptionId });
      const newStatus = toLocalStatus(polarSub.status);

      if (newStatus === sub.status) continue;

      const patch: Parameters<typeof updateSubscription>[1] = {
        status: newStatus,
        currentPeriodStart: polarSub.currentPeriodStart.toISOString(),
        currentPeriodEnd: polarSub.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: polarSub.cancelAtPeriodEnd,
      };

      // DB shows active/past_due but Polar says otherwise → apply grace period
      if (newStatus === "canceled" || newStatus === "expired") {
        patch.graceEndAt = graceEndAt();
      }

      await updateSubscription(sub.id, patch, admin);
      updated++;
    } catch {
      // Log but continue so one bad Polar call doesn't abort the whole sync
      console.error(`[billing/sync] Failed to sync subscription ${sub.polarSubscriptionId}`);
    }
  }

  return { checked: subscriptions.length, updated };
}
