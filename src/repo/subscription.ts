import { createServerSupabaseClient } from "./supabase-server";
import type { Subscription, SubscriptionInsert, SubscriptionStatus, PlanTier } from "@/types/billing";
import type { Database } from "@/types/database";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    landlordId: row.landlord_id,
    planTier: row.plan_tier as PlanTier,
    polarSubscriptionId: row.polar_subscription_id,
    polarCustomerId: row.polar_customer_id,
    status: row.status as SubscriptionStatus,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSubscriptionByLandlord(
  landlordId: string,
): Promise<Subscription | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("landlord_id", landlordId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return null;
  return toSubscription(data as unknown as SubscriptionRow);
}

export async function createSubscription(
  input: SubscriptionInsert,
): Promise<Subscription> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      landlord_id: input.landlordId,
      plan_tier: input.planTier,
      polar_subscription_id: input.polarSubscriptionId ?? null,
      polar_customer_id: input.polarCustomerId ?? null,
      status: input.status ?? "active",
      current_period_start:
        input.currentPeriodStart ?? new Date().toISOString(),
      current_period_end:
        input.currentPeriodEnd ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error)
    throw new Error(`Failed to create subscription: ${error.message}`);
  return toSubscription(data as unknown as SubscriptionRow);
}

export async function updateSubscription(
  id: string,
  input: {
    planTier?: PlanTier;
    status?: SubscriptionStatus;
    polarSubscriptionId?: string | null;
    polarCustomerId?: string | null;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  },
): Promise<Subscription> {
  const supabase = await createServerSupabaseClient();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.planTier !== undefined) update.plan_tier = input.planTier;
  if (input.status !== undefined) update.status = input.status;
  if (input.polarSubscriptionId !== undefined)
    update.polar_subscription_id = input.polarSubscriptionId;
  if (input.polarCustomerId !== undefined)
    update.polar_customer_id = input.polarCustomerId;
  if (input.currentPeriodStart !== undefined)
    update.current_period_start = input.currentPeriodStart;
  if (input.currentPeriodEnd !== undefined)
    update.current_period_end = input.currentPeriodEnd;
  if (input.cancelAtPeriodEnd !== undefined)
    update.cancel_at_period_end = input.cancelAtPeriodEnd;

  const { data, error } = await supabase
    .from("subscriptions")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error)
    throw new Error(`Failed to update subscription: ${error.message}`);
  return toSubscription(data as unknown as SubscriptionRow);
}

export async function getSubscriptionByPolarId(
  polarSubscriptionId: string,
): Promise<Subscription | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("polar_subscription_id", polarSubscriptionId)
    .maybeSingle();

  if (error || !data) return null;
  return toSubscription(data as unknown as SubscriptionRow);
}

export async function countContractsByLandlord(
  landlordId: string,
): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("landlord_id", landlordId);

  if (error)
    throw new Error(`Failed to count contracts: ${error.message}`);
  return count ?? 0;
}
