import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  return NextResponse.json(landlord);
}
