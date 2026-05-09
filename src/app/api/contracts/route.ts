import { NextResponse } from "next/server";
import { registerContract } from "@/service/contract-registration";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { canPerformAction } from "@/service/billing";
import { getContractsByLandlord } from "@/repo/contract";
import { getPropertiesByLandlord, createProperty } from "@/repo/property";
import type { ContractFormData } from "@/types/ocr";
import type { OcrResult } from "@/types/ocr";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const contracts = await getContractsByLandlord(landlord.id);
  return NextResponse.json(contracts);
}

async function ensurePropertyId(
  landlordId: string,
  propertyId: string,
): Promise<string> {
  if (propertyId && propertyId !== "manual") return propertyId;

  const properties = await getPropertiesByLandlord(landlordId);
  if (properties.length > 0) return properties[0].id;

  const property = await createProperty({
    landlordId,
    address: "주소 미입력",
    type: "원룸",
  });
  return property.id;
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");

  const gate = await canPerformAction(landlord.id, "create_contract");
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, code: "plan_limit" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { formData, ocrResult, originalFileUrl } = body as {
    formData: ContractFormData;
    ocrResult: OcrResult | null;
    originalFileUrl: string | null;
  };

  if (!formData.tenantName || !formData.deposit) {
    return NextResponse.json(
      { error: "필수 항목이 누락되었습니다." },
      { status: 400 },
    );
  }

  const resolvedPropertyId = await ensurePropertyId(
    landlord.id,
    formData.propertyId,
  );

  const contract = await registerContract(
    { ...formData, propertyId: resolvedPropertyId },
    ocrResult,
    originalFileUrl,
  );

  return NextResponse.json(contract, { status: 201 });
}
