export type PlanTier = "free" | "pro" | "business";

export interface Plan {
  tier: PlanTier;
  name: string;
  price: number;
  currency: string;
  interval: "month";
  limits: PlanLimits;
  features: string[];
  polarProductId?: string;
  polarPriceId?: string;
}

export interface PlanLimits {
  maxContracts: number;
  ocrEnabled: boolean;
  storageGB: number;
  renewalProposals: boolean;
  communicationHistory: boolean;
  customBranding: boolean;
}

export interface Subscription {
  id: string;
  landlordId: string;
  planTier: PlanTier;
  polarSubscriptionId: string | null;
  polarCustomerId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export interface SubscriptionInsert {
  landlordId: string;
  planTier: PlanTier;
  polarSubscriptionId?: string | null;
  polarCustomerId?: string | null;
  status?: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}
