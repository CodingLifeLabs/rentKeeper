import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("./supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

import { createServerSupabaseClient } from "./supabase-server";
import {
  getSubscriptionByLandlord,
  createSubscription,
  updateSubscription,
  getSubscriptionByPolarId,
  getAllSubscriptionsForSync,
  countContractsByLandlord,
} from "./subscription";

const mockedCreateClient = createServerSupabaseClient as jest.Mock;

describe("subscription repo", () => {
  let mockClient: Record<string, ReturnType<typeof jest.fn>>;

  beforeEach(() => {
    mockClient = {
      from: jest.fn(() => mockClient),
      select: jest.fn(() => mockClient),
      insert: jest.fn(() => mockClient),
      update: jest.fn(() => mockClient),
      eq: jest.fn(() => mockClient),
      in: jest.fn(() => mockClient),
      not: jest.fn(() => mockClient),
      order: jest.fn(() => mockClient),
      limit: jest.fn(() => mockClient),
      maybeSingle: jest.fn(),
      single: jest.fn(),
    };
    mockedCreateClient.mockResolvedValue(mockClient);
  });

  describe("getSubscriptionByLandlord", () => {
    it("returns mapped subscription when found", async () => {
      const row = {
        id: "sub-1",
        landlord_id: "ll-1",
        plan_tier: "pro",
        polar_subscription_id: "ps-1",
        polar_customer_id: "pc-1",
        status: "active",
        current_period_start: "2024-01-01T00:00:00Z",
        current_period_end: "2024-02-01T00:00:00Z",
        cancel_at_period_end: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };
      mockClient.maybeSingle.mockResolvedValue({ data: row, error: null });

      const result = await getSubscriptionByLandlord("ll-1");

      expect(result).toEqual({
        id: "sub-1",
        landlordId: "ll-1",
        planTier: "pro",
        polarSubscriptionId: "ps-1",
        polarCustomerId: "pc-1",
        status: "active",
        currentPeriodStart: "2024-01-01T00:00:00Z",
        currentPeriodEnd: "2024-02-01T00:00:00Z",
        cancelAtPeriodEnd: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      });
    });

    it("returns null when not found", async () => {
      mockClient.maybeSingle.mockResolvedValue({ data: null, error: null });
      const result = await getSubscriptionByLandlord("ll-1");
      expect(result).toBeNull();
    });

    it("returns null on database error", async () => {
      mockClient.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: "fail" },
      });
      const result = await getSubscriptionByLandlord("ll-1");
      expect(result).toBeNull();
    });
  });

  describe("createSubscription", () => {
    it("creates and returns mapped subscription", async () => {
      const row = {
        id: "sub-2",
        landlord_id: "ll-1",
        plan_tier: "business",
        polar_subscription_id: null,
        polar_customer_id: null,
        status: "active",
        current_period_start: "2024-01-01T00:00:00Z",
        current_period_end: "2024-02-01T00:00:00Z",
        cancel_at_period_end: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };
      mockClient.single.mockResolvedValue({ data: row, error: null });

      const result = await createSubscription({
        landlordId: "ll-1",
        planTier: "business",
      });

      expect(result.planTier).toBe("business");
      expect(mockClient.insert).toHaveBeenCalled();
    });

    it("throws on database error", async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { message: "fail" },
      });
      await expect(
        createSubscription({ landlordId: "ll-1", planTier: "pro" }),
      ).rejects.toThrow("Failed to create subscription: fail");
    });
  });

  describe("updateSubscription", () => {
    it("updates and returns mapped subscription", async () => {
      const row = {
        id: "sub-1",
        landlord_id: "ll-1",
        plan_tier: "pro",
        polar_subscription_id: "ps-1",
        polar_customer_id: "pc-1",
        status: "past_due",
        current_period_start: "2024-01-01T00:00:00Z",
        current_period_end: "2024-02-01T00:00:00Z",
        cancel_at_period_end: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-06-01T00:00:00Z",
      };
      mockClient.single.mockResolvedValue({ data: row, error: null });

      const result = await updateSubscription("sub-1", { status: "past_due" });
      expect(result.status).toBe("past_due");
    });

    it("throws on database error", async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { message: "fail" },
      });
      await expect(
        updateSubscription("sub-1", { status: "canceled" }),
      ).rejects.toThrow("Failed to update subscription: fail");
    });
  });

  describe("getSubscriptionByPolarId", () => {
    it("returns subscription when found", async () => {
      const row = {
        id: "sub-1",
        landlord_id: "ll-1",
        plan_tier: "pro",
        polar_subscription_id: "polar-123",
        polar_customer_id: "pc-1",
        status: "active",
        current_period_start: "2024-01-01T00:00:00Z",
        current_period_end: "2024-02-01T00:00:00Z",
        cancel_at_period_end: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };
      mockClient.maybeSingle.mockResolvedValue({ data: row, error: null });

      const result = await getSubscriptionByPolarId("polar-123");
      expect(result?.polarSubscriptionId).toBe("polar-123");
    });

    it("returns null when not found", async () => {
      mockClient.maybeSingle.mockResolvedValue({ data: null, error: null });
      const result = await getSubscriptionByPolarId("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getAllSubscriptionsForSync", () => {
    it("returns mapped subscriptions", async () => {
      const rows = [
        {
          id: "sub-1",
          landlord_id: "ll-1",
          plan_tier: "pro",
          polar_subscription_id: "ps-1",
          polar_customer_id: "pc-1",
          status: "active",
          current_period_start: "2024-01-01T00:00:00Z",
          current_period_end: "2024-02-01T00:00:00Z",
          cancel_at_period_end: false,
          grace_end_at: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      mockClient.in.mockResolvedValue({ data: rows, error: null });

      const result = await getAllSubscriptionsForSync();
      expect(result).toHaveLength(1);
      expect(result[0].polarSubscriptionId).toBe("ps-1");
    });

    it("returns empty array when no data", async () => {
      mockClient.in.mockResolvedValue({ data: null, error: null });
      const result = await getAllSubscriptionsForSync();
      expect(result).toEqual([]);
    });

    it("throws on database error", async () => {
      mockClient.in.mockResolvedValue({
        data: null,
        error: { message: "sync fail" },
      });
      await expect(getAllSubscriptionsForSync()).rejects.toThrow(
        "Failed to fetch subscriptions for sync: sync fail",
      );
    });
  });

  describe("countContractsByLandlord", () => {
    it("returns count from database", async () => {
      mockClient.not.mockResolvedValue({ count: 15, error: null });
      const result = await countContractsByLandlord("ll-1");
      expect(result).toBe(15);
    });

    it("returns 0 when count is null", async () => {
      mockClient.not.mockResolvedValue({ count: null, error: null });
      const result = await countContractsByLandlord("ll-1");
      expect(result).toBe(0);
    });

    it("throws on database error", async () => {
      mockClient.not.mockResolvedValue({
        count: null,
        error: { message: "fail" },
      });
      await expect(countContractsByLandlord("ll-1")).rejects.toThrow(
        "Failed to count contracts: fail",
      );
    });
  });
});
