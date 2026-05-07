import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getContractsByLandlord } from "@/repo/contract";
import { createExportLog } from "@/repo/export-log";
import { getCurrentPlanTier } from "@/service/billing";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");

  const tier = await getCurrentPlanTier(landlord.id);
  if (tier !== "business") {
    return NextResponse.json(
      { error: "ZIP 내보내기는 Business 플랜에서 사용할 수 있습니다." },
      { status: 403 },
    );
  }

  const contracts = await getContractsByLandlord(landlord.id);
  const files = contracts
    .filter((c) => c.originalFileUrl)
    .map((c) => ({ name: `${c.tenantName}_${c.id}.pdf`, url: c.originalFileUrl! }));

  if (files.length === 0) {
    return NextResponse.json(
      { error: "다운로드할 계약서 파일이 없습니다." },
      { status: 404 },
    );
  }

  await createExportLog({
    landlordId: landlord.id,
    exportType: "zip",
    rowCount: files.length,
    includePhone: false,
  });

  return NextResponse.json({
    files,
    message: "파일 목록이 생성되었습니다. 클라이언트에서 순차 다운로드합니다.",
  });
}
