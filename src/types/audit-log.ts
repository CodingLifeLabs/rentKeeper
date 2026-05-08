export type AuditAction =
  | "export_csv"
  | "export_xlsx"
  | "export_zip"
  | "proposal_viewed"
  | "proposal_sent"
  | "proposal_responded"
  | "contract_created"
  | "contract_updated"
  | "login"
  | "settings_changed"
  // Billing
  | "checkout_initiated"
  | "subscription_activated"
  | "subscription_updated"
  | "subscription_canceled"
  | "subscription_expired"
  | "subscription_past_due"
  | "subscription_refunded";

export interface AuditLog {
  id: string;
  landlordId: string;
  action: AuditAction;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogInsert {
  landlordId: string;
  action: AuditAction;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export interface TodayAction {
  id: string;
  type: "expiring_soon" | "no_response" | "renewal_contact";
  label: string;
  description: string;
  contractId: string;
  tenantName: string;
  daysUntil?: number;
  daysSinceSent?: number;
  urgency: "high" | "medium" | "low";
}
