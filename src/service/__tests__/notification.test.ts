import {
  sendNotification,
  getEnabledChannels,
  resolveNotificationSettings,
} from "@/service/notification";
import { DEFAULT_PREFERENCES } from "@/types/notification-settings";
import type { NotificationSettings } from "@/types/notification-settings";
describe("notification", () => {
  describe("sendNotification", () => {
    it("sends push notification successfully", async () => {
      const result = await sendNotification("push", {
        contractId: "test-id",
        tenantName: "홍길동",
        type: "d90",
        message: "만기 D-90",
      });
      expect(result.success).toBe(true);
      expect(result.channel).toBe("push");
    });

    it("sends email notification successfully", async () => {
      const result = await sendNotification("email", {
        contractId: "test-id",
        tenantName: "홍길동",
        type: "d90",
        message: "만기 D-90",
      });
      expect(result.success).toBe(true);
      expect(result.channel).toBe("email");
    });

    it("sends kakao notification successfully", async () => {
      const result = await sendNotification("kakao", {
        contractId: "test-id",
        tenantName: "홍길동",
        type: "d90",
        message: "만기 D-90",
      });
      expect(result.success).toBe(true);
      expect(result.channel).toBe("kakao");
    });
  });

  describe("getEnabledChannels", () => {
    const settings: NotificationSettings = {
      landlordId: "landlord-1",
      preferences: DEFAULT_PREFERENCES,
      quietHoursStart: null,
      quietHoursEnd: null,
    };

    it("returns push and email for d90 type", () => {
      const channels = getEnabledChannels(settings, "d90");
      expect(channels).toContain("push");
      expect(channels).toContain("email");
      expect(channels).not.toContain("kakao");
    });

    it("returns all enabled channels for d30 type", () => {
      const channels = getEnabledChannels(settings, "d30");
      expect(channels).toContain("push");
      expect(channels).toContain("email");
    });

    it("excludes disabled kakao channel for d90", () => {
      const channels = getEnabledChannels(settings, "d90");
      expect(channels).not.toContain("kakao");
    });
  });

  describe("resolveNotificationSettings", () => {
    it("returns defaults when no saved settings", () => {
      const result = resolveNotificationSettings(null);
      expect(result.preferences).toEqual(DEFAULT_PREFERENCES);
      expect(result.landlordId).toBe("");
    });

    it("returns saved settings when provided", () => {
      const saved: NotificationSettings = {
        landlordId: "landlord-1",
        preferences: [
          { channel: "push", enabled: false, thresholds: ["d90"] },
        ],
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
      };
      const result = resolveNotificationSettings(saved);
      expect(result).toEqual(saved);
    });
  });
});
