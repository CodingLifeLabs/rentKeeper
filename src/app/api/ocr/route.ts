import { NextResponse } from "next/server";
import { processOcr } from "@/service/ocr";
import type { OcrJobRequest } from "@/types/ocr";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "이미지 파일이 필요합니다." },
      { status: 400 },
    );
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, PDF)" },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const imageUrl = `data:${file.type};base64,${base64}`;

  const jobRequest: OcrJobRequest = {
    imageUrl,
    fileName: file.name,
  };

  const result = processOcr(jobRequest);

  return NextResponse.json(result);
}
