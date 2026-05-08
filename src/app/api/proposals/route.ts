import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { sendRenewalProposal } from "@/service/proposal";
import { getProposalsByContract } from "@/repo/renewal-proposal";
import { recordAudit } from "@/service/audit-log";
import type { RenewalProposalInsert } from "@/types/renewal-proposal";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get("contractId");

  if (!contractId) {
    return NextResponse.json(
      { error: "contractId가 필요합니다." },
      { status: 400 },
    );
  }

  const proposals = await getProposalsByContract(contractId);
  return NextResponse.json(proposals);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");

  const body = await request.json();
  const input = body as RenewalProposalInsert;

  if (!input.contractId || !input.proposedRent || !input.proposedDeposit) {
    return NextResponse.json(
      { error: "필수 항목이 누락되었습니다." },
      { status: 400 },
    );
  }

  const proposal = await sendRenewalProposal(input);

  await recordAudit(landlord.id, "proposal_sent", proposal.id, {
    contractId: input.contractId,
    proposedRent: input.proposedRent,
  }).catch(() => {});

  return NextResponse.json(proposal, { status: 201 });
}
