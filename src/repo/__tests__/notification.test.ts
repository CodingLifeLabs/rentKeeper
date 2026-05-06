import {
  getNotificationsByContract,
  createNotification,
} from "@/repo/notification";

jest.mock("@/repo/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

function createMockClient() {
  return {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    })),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  const { createServerSupabaseClient } =
    require("@/repo/supabase-server");
  (createServerSupabaseClient as jest.Mock).mockResolvedValue(
    createMockClient(),
  );
});

describe("notification repo", () => {
  describe("getNotificationsByContract", () => {
    it("fetches notifications for a contract", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({
            data: [
              {
                id: "n1",
                contract_id: "c1",
                type: "d90",
                sent_at: "2026-01-01",
                channel: "push",
              },
            ],
            error: null,
          }),
        }),
      });

      const result = await getNotificationsByContract("c1");
      expect(result).toHaveLength(1);
      expect(result[0].contractId).toBe("c1");
      expect(result[0].type).toBe("d90");
    });

    it("throws on error", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({
            data: null,
            error: { message: "DB error" },
          }),
        }),
      });

      await expect(
        getNotificationsByContract("c1"),
      ).rejects.toThrow("Failed to fetch notifications");
    });
  });

  describe("createNotification", () => {
    it("creates a notification and returns mapped object", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: {
              id: "n2",
              contract_id: "c1",
              type: "d30",
              sent_at: "2026-02-01",
              channel: "email",
            },
            error: null,
          }),
        }),
      });

      const result = await createNotification({
        contractId: "c1",
        type: "d30",
        channel: "email",
      });
      expect(result.id).toBe("n2");
      expect(result.channel).toBe("email");
    });

    it("throws on insert error", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: null,
            error: { message: "Insert failed" },
          }),
        }),
      });

      await expect(
        createNotification({
          contractId: "c1",
          type: "d30",
          channel: "push",
        }),
      ).rejects.toThrow("Failed to create notification");
    });
  });
});
