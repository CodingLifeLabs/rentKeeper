import { NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import {
  getPreferences,
  upsertPreferences,
} from "@/repo/notification-preferences";
import type { NotificationPreference } from "@/types/notification-settings";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const preferences = await getPreferences(landlord.id);
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  let body: { preferences: NotificationPreference[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.preferences)) {
    return NextResponse.json(
      { error: "preferences 배열이 필요합니다." },
      { status: 400 },
    );
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  await upsertPreferences(landlord.id, body.preferences);
  return NextResponse.json({ ok: true });
}
