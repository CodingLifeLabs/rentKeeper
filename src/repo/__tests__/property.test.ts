/* eslint-disable @typescript-eslint/no-require-imports */
import {
  getPropertiesByLandlord,
  getPropertyById,
  createProperty,
} from "@/repo/property";

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

const mockPropertyRow = {
  id: "p1",
  landlord_id: "l1",
  address: "서울시 강남구 역삼로 123",
  unit_number: "201",
  type: "원룸",
  area_sqm: 25,
  created_at: "2025-01-01",
};

describe("property repo", () => {
  describe("getPropertiesByLandlord", () => {
    it("fetches properties for a landlord", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({
            data: [mockPropertyRow],
            error: null,
          }),
        }),
      });

      const result = await getPropertiesByLandlord("l1");
      expect(result).toHaveLength(1);
      expect(result[0].address).toBe("서울시 강남구 역삼로 123");
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
        getPropertiesByLandlord("l1"),
      ).rejects.toThrow("Failed to fetch properties");
    });
  });

  describe("getPropertyById", () => {
    it("returns property when found", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: mockPropertyRow,
            error: null,
          }),
        }),
      });

      const result = await getPropertyById("p1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("p1");
    });

    it("returns null when not found", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      });

      const result = await getPropertyById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("createProperty", () => {
    it("creates property and returns mapped object", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: mockPropertyRow,
            error: null,
          }),
        }),
      });

      const result = await createProperty({
        landlordId: "l1",
        address: "서울시 강남구 역삼로 123",
        unitNumber: "201",
        type: "원룸",
        areaSqm: 25,
      });
      expect(result.id).toBe("p1");
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
        createProperty({
          landlordId: "l1",
          address: "test",
          type: "원룸",
        }),
      ).rejects.toThrow("Failed to create property");
    });
  });
});
