export type ProposalStatus = "sent" | "accepted" | "negotiating" | "rejected";

export interface RenewalProposal {
  id: string;
  contractId: string;
  proposedRent: number;
  proposedDeposit: number;
  message: string | null;
  shareToken: string;
  status: ProposalStatus;
  sentAt: string;
  respondedAt: string | null;
  createdAt: string;
}

export interface RenewalProposalInsert {
  contractId: string;
  proposedRent: number;
  proposedDeposit: number;
  message?: string;
}

export interface TenantResponse {
  proposalId: string;
  shareToken: string;
  action: "accept" | "reject" | "negotiate";
  tenantMessage?: string;
}
