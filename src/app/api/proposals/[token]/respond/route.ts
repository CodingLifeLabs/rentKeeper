import { NextResponse } from "next/server";
import { handleTenantResponse } from "@/service/proposal";
import type { TenantResponse } from "@/types/renewal-proposal";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await request.json();
  const response = body as TenantResponse;

  if (!response.proposalId || !response.action) {
    return NextResponse.json(
      { error: "필수 항목이 누락되었습니다." },
      { status: 400 },
    );
  }

  if (!["accept", "reject", "negotiate"].includes(response.action)) {
    return NextResponse.json(
      { error: "유효하지 않은 응답입니다." },
      { status: 400 },
    );
  }

  try {
    const updated = await handleTenantResponse({
      ...response,
      shareToken: token,
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
