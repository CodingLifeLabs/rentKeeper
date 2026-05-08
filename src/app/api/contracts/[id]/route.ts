import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getContractById, updateContract } from "@/repo/contract";
import { getPropertyById } from "@/repo/property";
import type { ContractUpdate } from "@/types/storage-file";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) {
    return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const property = await getPropertyById(contract.propertyId);
  if (!property || property.landlordId !== landlord.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  return NextResponse.json({ ...contract, property });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) {
    return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const property = await getPropertyById(contract.propertyId);
  if (!property || property.landlordId !== landlord.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = (await request.json()) as ContractUpdate;
  const updated = await updateContract(id, body);
  return NextResponse.json(updated);
}
