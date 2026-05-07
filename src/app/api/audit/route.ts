import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getAuditHistory } from "@/service/audit-log";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const logs = await getAuditHistory(landlord.id, 100);

  return NextResponse.json(logs);
}
