import { NextResponse } from "next/server";
import { getProposalByToken } from "@/repo/renewal-proposal";
import { getContractById } from "@/repo/contract";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const proposal = await getProposalByToken(token);

  if (!proposal) {
    return NextResponse.json(
      { error: "제안서를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const contract = await getContractById(proposal.contractId);

  return NextResponse.json({
    ...proposal,
    currentRent: contract?.monthlyRent ?? 0,
    currentDeposit: contract?.deposit ?? 0,
    tenantName: contract?.tenantName ?? "",
    endDate: contract?.endDate ?? "",
  });
}
