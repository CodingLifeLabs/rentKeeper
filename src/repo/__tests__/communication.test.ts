/* eslint-disable @typescript-eslint/no-require-imports */
import {
  getCommunicationsByContract,
  createCommunication,
  markCommunicationOpened,
} from "@/repo/communication";

jest.mock("@/repo/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

function createMockClient() {
  return {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
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

describe("communication repo", () => {
  describe("getCommunicationsByContract", () => {
    it("fetches communications for a contract", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({
            data: [
              {
                id: "comm1",
                contract_id: "c1",
                type: "notice",
                channel: "email",
                message: "만기 알림",
                opened_at: null,
                responded_at: null,
                created_at: "2026-01-01",
              },
            ],
            error: null,
          }),
        }),
      });

      const result = await getCommunicationsByContract("c1");
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("notice");
      expect(result[0].message).toBe("만기 알림");
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
        getCommunicationsByContract("c1"),
      ).rejects.toThrow("Failed to fetch communications");
    });
  });

  describe("createCommunication", () => {
    it("creates a communication record", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: {
              id: "comm2",
              contract_id: "c1",
              type: "notice",
              channel: "email",
              message: "D-90 알림",
              opened_at: null,
              responded_at: null,
              created_at: "2026-01-01",
            },
            error: null,
          }),
        }),
      });

      const result = await createCommunication({
        contractId: "c1",
        type: "notice",
        channel: "email",
        message: "D-90 알림",
      });
      expect(result.id).toBe("comm2");
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
        createCommunication({
          contractId: "c1",
          type: "notice",
          channel: "email",
          message: "test",
        }),
      ).rejects.toThrow("Failed to create communication");
    });
  });

  describe("markCommunicationOpened", () => {
    it("marks communication as opened", async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: {
                id: "comm1",
                contract_id: "c1",
                type: "notice",
                channel: "email",
                message: "test",
                opened_at: "2026-01-02",
                responded_at: null,
                created_at: "2026-01-01",
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await markCommunicationOpened("comm1");
      expect(result).not.toBeNull();
      expect(result!.openedAt).toBe("2026-01-02");
    });

    it("returns null when not found", async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: null,
              error: { message: "Not found" },
            }),
          }),
        }),
      });

      const result = await markCommunicationOpened("nonexistent");
      expect(result).toBeNull();
    });
  });
});
