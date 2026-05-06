import type { ContractStatus } from "./contract";

export interface StateTransition {
  from: ContractStatus;
  to: ContractStatus;
  trigger: string;
}

export const VALID_TRANSITIONS: StateTransition[] = [
  { from: "draft", to: "active", trigger: "contract_confirmed" },
  { from: "active", to: "expiring_90", trigger: "d90_reached" },
  { from: "expiring_90", to: "expiring_30", trigger: "d30_reached" },
  { from: "expiring_30", to: "negotiating", trigger: "negotiation_started" },
  { from: "expiring_30", to: "move_out_pending", trigger: "move_out_notice" },
  { from: "negotiating", to: "renewed", trigger: "renewal_accepted" },
  { from: "renewed", to: "active", trigger: "new_contract_active" },
  { from: "move_out_pending", to: "vacant", trigger: "tenant_moved_out" },
  { from: "vacant", to: "active", trigger: "new_tenant_contracted" },
  { from: "vacant", to: "archived", trigger: "property_removed" },
];

export type ExpiryThreshold = "d90" | "d60" | "d30" | "d7";

export const EXPIRY_DAYS: Record<ExpiryThreshold, number> = {
  d90: 90,
  d60: 60,
  d30: 30,
  d7: 7,
};
