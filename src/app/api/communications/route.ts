import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/service/auth";
import { getCommunicationsByContract } from "@/repo/communication";

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

  const communications = await getCommunicationsByContract(contractId);
  return NextResponse.json(communications);
}
