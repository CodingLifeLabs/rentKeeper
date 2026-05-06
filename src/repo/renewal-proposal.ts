import { createServerSupabaseClient } from "./supabase-server";
import type {
  RenewalProposal,
  RenewalProposalInsert,
  ProposalStatus,
} from "@/types/renewal-proposal";
import type { Database } from "@/types/database";

type ProposalRow = Database["public"]["Tables"]["renewal_proposals"]["Row"];

function toProposal(row: ProposalRow): RenewalProposal {
  return {
    id: row.id,
    contractId: row.contract_id,
    proposedRent: row.proposed_rent ?? 0,
    proposedDeposit: row.proposed_deposit ?? 0,
    message: row.message,
    shareToken: row.share_token,
    status: row.status as ProposalStatus,
    sentAt: row.sent_at ?? "",
    respondedAt: row.responded_at,
    createdAt: row.id,
  };
}

export async function getProposalsByContract(
  contractId: string,
): Promise<RenewalProposal[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("renewal_proposals")
    .select("*")
    .eq("contract_id", contractId)
    .order("sent_at", { ascending: false });

  if (error)
    throw new Error(`Failed to fetch proposals: ${error.message}`);
  return (data as unknown as ProposalRow[]).map(toProposal);
}

export async function getProposalByToken(
  shareToken: string,
): Promise<RenewalProposal | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("renewal_proposals")
    .select("*")
    .eq("share_token", shareToken)
    .single();

  if (error || !data) return null;
  return toProposal(data as unknown as ProposalRow);
}

export async function createProposal(
  input: RenewalProposalInsert,
  shareToken: string,
): Promise<RenewalProposal> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("renewal_proposals")
    .insert({
      contract_id: input.contractId,
      proposed_rent: input.proposedRent,
      proposed_deposit: input.proposedDeposit,
      message: input.message ?? null,
      share_token: shareToken,
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error)
    throw new Error(`Failed to create proposal: ${error.message}`);
  return toProposal(data as unknown as ProposalRow);
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus,
): Promise<RenewalProposal> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("renewal_proposals")
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error)
    throw new Error(`Failed to update proposal: ${error.message}`);
  return toProposal(data as unknown as ProposalRow);
}
