import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getTodayActions } from "@/service/today-actions";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const actions = await getTodayActions(landlord.id);

  return NextResponse.json(actions);
}
