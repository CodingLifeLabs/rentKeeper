import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getContractsByLandlord } from "@/repo/contract";
import { generateCsv, getExportFilename } from "@/service/export";
import { createExportLog } from "@/repo/export-log";
import { recordAudit } from "@/service/audit-log";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const url = new URL(request.url);
  const includePhone = url.searchParams.get("phone") === "true";

  const contracts = await getContractsByLandlord(landlord.id);
  const csv = generateCsv(contracts, includePhone);
  const filename = getExportFilename("csv");

  await createExportLog({
    landlordId: landlord.id,
    exportType: "csv",
    rowCount: contracts.length,
    includePhone,
  }).catch(() => {});

  await recordAudit(landlord.id, "export_csv", undefined, { rowCount: contracts.length, includePhone }).catch(() => {});

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
