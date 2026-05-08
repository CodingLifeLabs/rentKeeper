import { createServerSupabaseClient } from "./supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subscription, SubscriptionInsert, SubscriptionStatus, PlanTier } from "@/types/billing";
import type { Database } from "@/types/database";

type DbClient = SupabaseClient<Database>;
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
    graceEndAt: row.grace_end_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getClient(client?: DbClient): Promise<DbClient> {
  return client ?? (await createServerSupabaseClient()) as DbClient;
}

export async function getSubscriptionByLandlord(
  landlordId: string,
  client?: DbClient,
): Promise<Subscription | null> {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("landlord_id", landlordId)
    .in("status", ["active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return toSubscription(data as unknown as SubscriptionRow);
}

export async function createSubscription(
  input: SubscriptionInsert,
  client?: DbClient,
): Promise<Subscription> {
  const supabase = await getClient(client);
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
    graceEndAt?: string | null;
  },
  client?: DbClient,
): Promise<Subscription> {
  const supabase = await getClient(client);
  const update: Database["public"]["Tables"]["subscriptions"]["Update"] = {
    updated_at: new Date().toISOString(),
    ...(input.planTier !== undefined && { plan_tier: input.planTier }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.polarSubscriptionId !== undefined && { polar_subscription_id: input.polarSubscriptionId }),
    ...(input.polarCustomerId !== undefined && { polar_customer_id: input.polarCustomerId }),
    ...(input.currentPeriodStart !== undefined && { current_period_start: input.currentPeriodStart }),
    ...(input.currentPeriodEnd !== undefined && { current_period_end: input.currentPeriodEnd }),
    ...(input.cancelAtPeriodEnd !== undefined && { cancel_at_period_end: input.cancelAtPeriodEnd }),
    ...(input.graceEndAt !== undefined && { grace_end_at: input.graceEndAt }),
  };

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
  client?: DbClient,
): Promise<Subscription | null> {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("polar_subscription_id", polarSubscriptionId)
    .maybeSingle();

  if (error || !data) return null;
  return toSubscription(data as unknown as SubscriptionRow);
}

export async function getAllSubscriptionsForSync(
  client?: DbClient,
): Promise<Subscription[]> {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .not("polar_subscription_id", "is", null)
    .in("status", ["active", "past_due"]);

  if (error) throw new Error(`Failed to fetch subscriptions for sync: ${error.message}`);
  return (data ?? []).map((row) => toSubscription(row as unknown as SubscriptionRow));
}

export async function countContractsByLandlord(
  landlordId: string,
  client?: DbClient,
): Promise<number> {
  const supabase = await getClient(client);
  const { count, error } = await supabase
    .from("contracts")
    .select("id, properties!inner(landlord_id)", { count: "exact", head: true })
    .eq("properties.landlord_id", landlordId)
    .not("status", "eq", "archived");

  if (error)
    throw new Error(`Failed to count contracts: ${error.message}`);
  return count ?? 0;
}
