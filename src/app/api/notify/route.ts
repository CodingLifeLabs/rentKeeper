import { NextResponse } from "next/server";
import {
  sendNotification,
  getEnabledChannels,
} from "@/service/notification";
import type { NotificationType, NotificationChannel } from "@/types/notification";
import type { NotificationSettings } from "@/types/notification-settings";

interface NotifyRequest {
  contractId: string;
  tenantName: string;
  type: NotificationType;
  message: string;
  settings: NotificationSettings;
}

export async function POST(request: Request) {
  const body = (await request.json()) as NotifyRequest;
  const { contractId, tenantName, type, message, settings } = body;

  if (!contractId || !type || !message) {
    return NextResponse.json(
      { error: "필수 항목이 누락되었습니다." },
      { status: 400 },
    );
  }

  const channels = getEnabledChannels(settings, type);
  const results = await Promise.all(
    channels.map((channel: NotificationChannel) =>
      sendNotification(channel, { contractId, tenantName, type, message }),
    ),
  );

  return NextResponse.json({ ok: true, results });
}
