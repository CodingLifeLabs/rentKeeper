import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getContractById } from "@/repo/contract";
import { getPropertyById } from "@/repo/property";
import { uploadFile, listFiles, deleteFile, getSignedUrl } from "@/repo/contract-files";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function verifyOwnership(request: Request, { params }: RouteParams) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 }) };

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) return { error: NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 }) };

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const property = await getPropertyById(contract.propertyId);
  if (!property || property.landlordId !== landlord.id) {
    return { error: NextResponse.json({ error: "권한이 없습니다." }, { status: 403 }) };
  }

  return { contractId: id, landlordId: landlord.id };
}

export async function GET(request: Request, ctx: RouteParams) {
  const result = await verifyOwnership(request, ctx);
  if ("error" in result) return result.error;

  try {
    const files = await listFiles(result.landlordId, result.contractId);
    const enriched = await Promise.all(
      files.map(async (f) => {
        const path = `${result.landlordId}/${result.contractId}/${f.name}`;
        const url = await getSignedUrl(path).catch(() => null);
        return { ...f, url };
      }),
    );
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request, ctx: RouteParams) {
  const result = await verifyOwnership(request, ctx);
  if ("error" in result) return result.error;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
  }

  const { path } = await uploadFile(result.landlordId, result.contractId, file);
  const url = await getSignedUrl(path);
  return NextResponse.json({ fileName: file.name, path, url }, { status: 201 });
}

export async function DELETE(request: Request, ctx: RouteParams) {
  const result = await verifyOwnership(request, ctx);
  if ("error" in result) return result.error;

  const { path } = (await request.json()) as { path: string };
  if (!path) {
    return NextResponse.json({ error: "경로가 필요합니다." }, { status: 400 });
  }

  await deleteFile(path);
  return NextResponse.json({ ok: true });
}
