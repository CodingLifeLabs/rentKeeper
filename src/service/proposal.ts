import { nanoid } from "nanoid";
import {
  createProposal as createProposalRepo,
  getProposalByToken,
  updateProposalStatus as updateProposalStatusRepo,
} from "@/repo/renewal-proposal";
import { getContractById, updateContractStatus } from "@/repo/contract";
import { createCommunication } from "@/repo/communication";
import { transitionContract } from "@/service/state-machine";
import type { RenewalProposal, RenewalProposalInsert, TenantResponse } from "@/types/renewal-proposal";
import type { ProposalStatus } from "@/types/renewal-proposal";

export async function generateShareToken(): Promise<string> {
  return nanoid(12);
}

export async function sendRenewalProposal(
  input: RenewalProposalInsert,
): Promise<RenewalProposal> {
  const contract = await getContractById(input.contractId);
  if (!contract) throw new Error("Contract not found");

  const shareToken = await generateShareToken();
  const proposal = await createProposalRepo(input, shareToken);

  const newStatus = transitionContract(contract.status, "negotiating");
  await updateContractStatus(contract.id, newStatus);

  await createCommunication({
    contractId: contract.id,
    type: "renewal",
    channel: "email",
    message: `갱신 제안서 발송: ${contract.tenantName} — 월세 ${input.proposedRent.toLocaleString()}원`,
  });

  return proposal;
}

export async function handleTenantResponse(
  response: TenantResponse,
): Promise<RenewalProposal> {
  const proposal = await getProposalByToken(response.shareToken);
  if (!proposal) throw new Error("Proposal not found");
  if (proposal.id !== response.proposalId) throw new Error("Token mismatch");
  if (proposal.status !== "sent" && proposal.status !== "negotiating") {
    throw new Error(`Proposal already responded: ${proposal.status}`);
  }

  const statusMap: Record<TenantResponse["action"], ProposalStatus> = {
    accept: "accepted",
    reject: "rejected",
    negotiate: "negotiating",
  };
  const newProposalStatus = statusMap[response.action];

  const updated = await updateProposalStatusRepo(proposal.id, newProposalStatus);

  const contract = await getContractById(proposal.contractId);
  if (contract) {
    if (response.action === "accept") {
      const newStatus = transitionContract(contract.status, "renewed");
      await updateContractStatus(contract.id, newStatus);
    } else if (response.action === "reject") {
      const newStatus = transitionContract(contract.status, "move_out_pending");
      await updateContractStatus(contract.id, newStatus);
    }
  }

  const actionLabel =
    response.action === "accept"
      ? "수락"
      : response.action === "reject"
        ? "거절"
        : "협의 요청";

  await createCommunication({
    contractId: proposal.contractId,
    type: "renewal",
    channel: "email",
    message: `임차인 응답 (${actionLabel}): ${response.tenantMessage ?? ""}`,
  });

  return updated;
}

export async function resolveProposal(
  proposalId: string,
  shareToken: string,
): Promise<RenewalProposal> {
  const proposal = await getProposalByToken(shareToken);
  if (!proposal) throw new Error("Proposal not found");
  if (proposal.id !== proposalId) throw new Error("Token mismatch");
  return proposal;
}
