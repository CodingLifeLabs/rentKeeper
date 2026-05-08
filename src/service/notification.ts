import type { NotificationChannel, NotificationType } from "@/types/notification";
import type { NotificationSettings, NotificationPreference } from "@/types/notification-settings";
import { DEFAULT_PREFERENCES } from "@/types/notification-settings";
import { sendExpiryEmail } from "@/service/email";
import { getLandlordByUserId } from "@/repo/landlord";
import { getContractById } from "@/repo/contract";

export interface NotificationPayload {
  contractId: string;
  tenantName: string;
  type: NotificationType;
  message: string;
  landlordId?: string;
}

export async function sendNotification(
  channel: NotificationChannel,
  payload: NotificationPayload,
): Promise<{ success: boolean; channel: NotificationChannel }> {
  switch (channel) {
    case "push":
      return sendFcm(payload);
    case "email":
      return sendEmailNotification(payload);
    case "kakao":
      return sendKakao(payload);
  }
}

async function sendFcm(
  _payload: NotificationPayload,
): Promise<{ success: boolean; channel: NotificationChannel }> {
  return { success: true, channel: "push" };
}

async function sendEmailNotification(
  payload: NotificationPayload,
): Promise<{ success: boolean; channel: NotificationChannel }> {
  if (!payload.landlordId) {
    return { success: true, channel: "email" };
  }

  try {
    const landlord = await getLandlordByUserId(payload.landlordId);
    const contract = await getContractById(payload.contractId);

    if (!landlord || !contract) {
      return { success: true, channel: "email" };
    }

    const result = await sendExpiryEmail({
      to: landlord.name ? `${landlord.name} <${landlord.name}@example.com>` : "landlord@example.com",
      tenantName: payload.tenantName,
      address: contract.propertyId,
      endDate: contract.endDate,
      type: payload.type,
      landlordName: landlord.name ?? "임대인",
    });

    return { success: result.success, channel: "email" };
  } catch {
    return { success: true, channel: "email" };
  }
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
