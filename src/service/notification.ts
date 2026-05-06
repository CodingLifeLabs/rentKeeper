import type { NotificationChannel, NotificationType } from "@/types/notification";
import type { NotificationSettings, NotificationPreference } from "@/types/notification-settings";
import { DEFAULT_PREFERENCES } from "@/types/notification-settings";

export interface NotificationPayload {
  contractId: string;
  tenantName: string;
  type: NotificationType;
  message: string;
}

export async function sendNotification(
  channel: NotificationChannel,
  payload: NotificationPayload,
): Promise<{ success: boolean; channel: NotificationChannel }> {
  switch (channel) {
    case "push":
      return sendFcm(payload);
    case "email":
      return sendEmail(payload);
    case "kakao":
      return sendKakao(payload);
  }
}

async function sendFcm(
  _payload: NotificationPayload,
): Promise<{ success: boolean; channel: NotificationChannel }> {
  return { success: true, channel: "push" };
}

async function sendEmail(
  _payload: NotificationPayload,
): Promise<{ success: boolean; channel: NotificationChannel }> {
  return { success: true, channel: "email" };
}

async function sendKakao(
  _payload: NotificationPayload,
): Promise<{ success: boolean; channel: NotificationChannel }> {
  return { success: true, channel: "kakao" };
}

export function getEnabledChannels(
  settings: NotificationSettings,
  type: NotificationType,
): NotificationChannel[] {
  return settings.preferences
    .filter(
      (p: NotificationPreference) =>
        p.enabled && p.thresholds.includes(type as never),
    )
    .map((p: NotificationPreference) => p.channel);
}

export function resolveNotificationSettings(
  saved: NotificationSettings | null,
): NotificationSettings {
  if (saved) return saved;
  return {
    landlordId: "",
    preferences: DEFAULT_PREFERENCES,
    quietHoursStart: null,
    quietHoursEnd: null,
  };
}
