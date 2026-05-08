import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getContractsByLandlord } from "@/repo/contract";
import { generateXlsx, getExportFilename } from "@/service/export";
import { createExportLog } from "@/repo/export-log";
import { getCurrentPlanTier } from "@/service/billing";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");

  const tier = await getCurrentPlanTier(landlord.id);
  if (tier === "free") {
    return NextResponse.json(
      { error: "Excel 내보내기는 Pro 이상 플랜에서 사용할 수 있습니다." },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const includePhone = url.searchParams.get("phone") === "true";

  const contracts = await getContractsByLandlord(landlord.id);
  const buffer = await generateXlsx(contracts, includePhone);
  const filename = getExportFilename("xlsx");

  await createExportLog({
    landlordId: landlord.id,
    exportType: "xlsx",
    rowCount: contracts.length,
    includePhone,
  }).catch(() => {});

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
