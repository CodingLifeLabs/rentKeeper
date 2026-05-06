import type { NotificationChannel } from "./notification";
import type { ExpiryThreshold } from "./state-machine";

export interface NotificationPreference {
  channel: NotificationChannel;
  enabled: boolean;
  thresholds: ExpiryThreshold[];
}

export interface NotificationSettings {
  landlordId: string;
  preferences: NotificationPreference[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export const DEFAULT_PREFERENCES: NotificationPreference[] = [
  { channel: "push", enabled: true, thresholds: ["d90", "d60", "d30", "d7"] },
  { channel: "email", enabled: true, thresholds: ["d90", "d30", "d7"] },
  { channel: "kakao", enabled: false, thresholds: ["d30", "d7"] },
];
