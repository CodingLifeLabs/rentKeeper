import { NextResponse } from "next/server";
import { registerContract } from "@/service/contract-registration";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getContractsByLandlord } from "@/repo/contract";
import type { ContractFormData } from "@/types/ocr";
import type { OcrResult } from "@/types/ocr";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const contracts = await getContractsByLandlord(landlord.id);
  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  await getOrCreateLandlord(user.id, user.email ?? "");

  const body = await request.json();
  const { formData, ocrResult, originalFileUrl } = body as {
    formData: ContractFormData;
    ocrResult: OcrResult | null;
    originalFileUrl: string | null;
  };

  if (!formData.propertyId || !formData.tenantName || !formData.deposit) {
    return NextResponse.json(
      { error: "필수 항목이 누락되었습니다." },
      { status: 400 },
    );
  }

  const contract = await registerContract(
    formData,
    ocrResult,
    originalFileUrl,
  );

  return NextResponse.json(contract, { status: 201 });
}
