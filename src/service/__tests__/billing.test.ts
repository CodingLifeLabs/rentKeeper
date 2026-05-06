jest.mock("@/repo/subscription", () => ({
  getSubscriptionByLandlord: jest.fn(),
  createSubscription: jest.fn(),
  updateSubscription: jest.fn(),
  getSubscriptionByPolarId: jest.fn(),
  countContractsByLandlord: jest.fn(),
}));

jest.mock("@/repo/landlord", () => ({
  getLandlordByUserId: jest.fn(),
}));

jest.mock("@polar-sh/sdk", () => ({
  Polar: jest.fn().mockImplementation(() => ({
    checkouts: {
      create: jest.fn(),
    },
  })),
}));

jest.mock("@/config/plans", () => ({
  getPlan: jest.fn((tier: string) => {
    const plans: Record<string, Record<string, unknown>> = {
      free: { tier: "free", polarProductId: undefined, price: 0 },
      pro: { tier: "pro", polarProductId: "prod_pro", price: 9900 },
      business: { tier: "business", polarProductId: "prod_biz", price: 24900 },
    };
    return plans[tier];
  }),
  getPlanLimits: jest.fn((tier: string) => {
    const limits: Record<string, Record<string, unknown>> = {
      free: { maxContracts: 3, ocrEnabled: false, storageGB: 0.5, renewalProposals: false, communicationHistory: false, customBranding: false },
      pro: { maxContracts: 20, ocrEnabled: true, storageGB: 5, renewalProposals: true, communicationHistory: true, customBranding: false },
      business: { maxContracts: 100, ocrEnabled: true, storageGB: 50, renewalProposals: true, communicationHistory: true, customBranding: true },
    };
    return limits[tier];
  }),
  POLAR_ACCESS_TOKEN: "test-token",
  POLAR_SERVER: "sandbox",
}));

import {
  getCheckoutUrl,
  getCurrentSubscription,
  getCurrentPlanTier,
  canPerformAction,
  handleWebhookEvent,
} from "@/service/billing";
import {
  getSubscriptionByLandlord,
  createSubscription,
  updateSubscription,
  getSubscriptionByPolarId,
  countContractsByLandlord,
} from "@/repo/subscription";
import { getLandlordByUserId } from "@/repo/landlord";
import { Polar } from "@polar-sh/sdk";

const mockGetSubscription = getSubscriptionByLandlord as jest.Mock;
const mockCreateSubscription = createSubscription as jest.Mock;
const mockUpdateSubscription = updateSubscription as jest.Mock;
const mockGetByPolarId = getSubscriptionByPolarId as jest.Mock;
const mockCountContracts = countContractsByLandlord as jest.Mock;
const mockGetLandlord = getLandlordByUserId as jest.Mock;

describe("billing service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCheckoutUrl", () => {
    it("throws for free plan without Polar product", async () => {
      await expect(getCheckoutUrl("user-1", "free")).rejects.toThrow(
        "Plan free does not support Polar checkout",
      );
    });

    it("throws when landlord not found", async () => {
      mockGetLandlord.mockResolvedValue(null);
      await expect(getCheckoutUrl("user-1", "pro")).rejects.toThrow(
        "Landlord not found",
      );
    });

    it("creates checkout and returns URL", async () => {
      mockGetLandlord.mockResolvedValue({ id: "ll-1" });
      const mockUrl = "https://checkout.polar.sh/abc";
      const polarInstance = new Polar();
      (polarInstance.checkouts.create as jest.Mock).mockResolvedValue({
        url: mockUrl,
      });

      const url = await getCheckoutUrl("user-1", "pro");
      expect(url).toBe(mockUrl);
    });
  });

  describe("getCurrentSubscription", () => {
    it("returns subscription from repo", async () => {
      const mockSub = { id: "sub-1", planTier: "pro" };
      mockGetSubscription.mockResolvedValue(mockSub);

      const result = await getCurrentSubscription("ll-1");
      expect(result).toEqual(mockSub);
    });

    it("returns null when no subscription", async () => {
      mockGetSubscription.mockResolvedValue(null);
      const result = await getCurrentSubscription("ll-1");
      expect(result).toBeNull();
    });
  });

  describe("getCurrentPlanTier", () => {
    it("returns free when no active subscription", async () => {
      mockGetSubscription.mockResolvedValue(null);
      const result = await getCurrentPlanTier("ll-1");
      expect(result).toBe("free");
    });

    it("returns free when subscription is not active", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "pro", status: "canceled" });
      const result = await getCurrentPlanTier("ll-1");
      expect(result).toBe("free");
    });

    it("returns the active plan tier", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "business", status: "active" });
      const result = await getCurrentPlanTier("ll-1");
      expect(result).toBe("business");
    });
  });

  describe("canPerformAction", () => {
    it("blocks contract creation at limit", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "free", status: "active" });
      mockCountContracts.mockResolvedValue(3);

      const result = await canPerformAction("ll-1", "create_contract");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("3");
    });

    it("allows contract creation under limit", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "free", status: "active" });
      mockCountContracts.mockResolvedValue(2);

      const result = await canPerformAction("ll-1", "create_contract");
      expect(result.allowed).toBe(true);
    });

    it("blocks OCR for free plan", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "free", status: "active" });
      const result = await canPerformAction("ll-1", "use_ocr");
      expect(result.allowed).toBe(false);
    });

    it("allows OCR for pro plan", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "pro", status: "active" });
      const result = await canPerformAction("ll-1", "use_ocr");
      expect(result.allowed).toBe(true);
    });

    it("blocks proposals for free plan", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "free", status: "active" });
      const result = await canPerformAction("ll-1", "send_proposal");
      expect(result.allowed).toBe(false);
    });

    it("blocks branding for pro plan", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "pro", status: "active" });
      const result = await canPerformAction("ll-1", "use_branding");
      expect(result.allowed).toBe(false);
    });

    it("allows branding for business plan", async () => {
      mockGetSubscription.mockResolvedValue({ planTier: "business", status: "active" });
      const result = await canPerformAction("ll-1", "use_branding");
      expect(result.allowed).toBe(true);
    });
  });

  describe("handleWebhookEvent", () => {
    it("creates subscription on subscription.active", async () => {
      mockGetSubscription.mockResolvedValue(null);
      mockCreateSubscription.mockResolvedValue({ id: "sub-new" });

      await handleWebhookEvent({
        type: "subscription.active",
        data: {
          id: "polar-sub-1",
          metadata: { landlordId: "ll-1", planTier: "pro" },
          customer: { id: "pc-1" },
          currentPeriodStart: new Date("2024-01-01"),
          currentPeriodEnd: new Date("2024-02-01"),
        },
      });

      expect(mockCreateSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          landlordId: "ll-1",
          planTier: "pro",
          polarSubscriptionId: "polar-sub-1",
        }),
      );
    });

    it("updates existing subscription on subscription.active", async () => {
      mockGetSubscription.mockResolvedValue({ id: "sub-existing" });
      mockUpdateSubscription.mockResolvedValue({ id: "sub-existing" });

      await handleWebhookEvent({
        type: "subscription.active",
        data: {
          id: "polar-sub-1",
          metadata: { landlordId: "ll-1", planTier: "business" },
          customer: { id: "pc-1" },
          currentPeriodStart: new Date("2024-01-01"),
          currentPeriodEnd: new Date("2024-02-01"),
        },
      });

      expect(mockUpdateSubscription).toHaveBeenCalledWith(
        "sub-existing",
        expect.objectContaining({ planTier: "business" }),
      );
    });

    it("cancels subscription on subscription.canceled", async () => {
      mockGetByPolarId.mockResolvedValue({ id: "sub-1" });
      mockUpdateSubscription.mockResolvedValue({ id: "sub-1" });

      await handleWebhookEvent({
        type: "subscription.canceled",
        data: {
          id: "polar-sub-1",
          metadata: { landlordId: "ll-1", planTier: "pro" },
        },
      });

      expect(mockUpdateSubscription).toHaveBeenCalledWith("sub-1", {
        status: "canceled",
        cancelAtPeriodEnd: true,
      });
    });

    it("expires subscription on subscription.revoked", async () => {
      mockGetByPolarId.mockResolvedValue({ id: "sub-1" });
      mockUpdateSubscription.mockResolvedValue({ id: "sub-1" });

      await handleWebhookEvent({
        type: "subscription.revoked",
        data: {
          id: "polar-sub-1",
          metadata: { landlordId: "ll-1", planTier: "pro" },
        },
      });

      expect(mockUpdateSubscription).toHaveBeenCalledWith("sub-1", {
        status: "expired",
      });
    });

    it("marks past_due on subscription.past_due", async () => {
      mockGetByPolarId.mockResolvedValue({ id: "sub-1" });
      mockUpdateSubscription.mockResolvedValue({ id: "sub-1" });

      await handleWebhookEvent({
        type: "subscription.past_due",
        data: {
          id: "polar-sub-1",
          metadata: { landlordId: "ll-1", planTier: "pro" },
        },
      });

      expect(mockUpdateSubscription).toHaveBeenCalledWith("sub-1", {
        status: "past_due",
      });
    });

    it("does nothing when metadata is missing", async () => {
      await handleWebhookEvent({
        type: "subscription.active",
        data: { id: "polar-sub-1" },
      });

      expect(mockCreateSubscription).not.toHaveBeenCalled();
      expect(mockUpdateSubscription).not.toHaveBeenCalled();
    });
  });
});
