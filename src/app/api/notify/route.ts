import { NextResponse } from "next/server";
import {
  sendNotification,
  getEnabledChannels,
} from "@/service/notification";
import type { NotificationType, NotificationChannel } from "@/types/notification";
import type { NotificationSettings } from "@/types/notification-settings";
import { getAuthenticatedUser, getOrCreateLandlord } from "@/service/auth";
import { getPreferences } from "@/repo/notification-preferences";
import { resolveNotificationSettings } from "@/service/notification";
import { createCommunication } from "@/repo/communication";
import { createNotification } from "@/repo/notification";

interface NotifyRequest {
  contractId: string;
  tenantName: string;
  type: NotificationType;
  message: string;
  settings?: NotificationSettings;
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const body = (await request.json()) as NotifyRequest;
  const { contractId, tenantName, type, message } = body;

  if (!contractId || !type || !message) {
    return NextResponse.json(
      { error: "필수 항목이 누락되었습니다." },
      { status: 400 },
    );
  }

  const savedPrefs = await getPreferences(landlord.id);
  const settings = body.settings ?? resolveNotificationSettings({
    landlordId: landlord.id,
    preferences: savedPrefs,
    quietHoursStart: null,
    quietHoursEnd: null,
  });
  const channels = getEnabledChannels(settings, type);

  const results = await Promise.all(
    channels.map((channel: NotificationChannel) =>
      sendNotification(channel, {
        contractId,
        tenantName,
        type,
        message,
        landlordId: landlord.id,
      }),
    ),
  );

  for (const channel of channels) {
    await createNotification({
      contractId,
      type,
      channel,
    }).catch(() => {});
  }

  await createCommunication({
    contractId,
    type: "notice",
    channel: "email",
    message,
  }).catch(() => {});

  return NextResponse.json({ ok: true, results });
}
