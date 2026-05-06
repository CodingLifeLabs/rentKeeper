import {
  getContractsByLandlord,
  getContractById,
  createContract,
  updateContractStatus,
  getExpiringContracts,
} from "@/repo/contract";

jest.mock("@/repo/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockLte = jest.fn();
const mockGt = jest.fn();

function createMockClient() {
  return {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
      lte: mockLte,
      gt: mockGt,
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

const mockContractRow = {
  id: "c1",
  property_id: "p1",
  tenant_name: "홍길동",
  tenant_phone: "010-1234-5678",
  deposit: 50000000,
  monthly_rent: 500000,
  start_date: "2025-03-01",
  end_date: "2026-03-01",
  contract_type: "월세",
  status: "active",
  original_file_url: null,
  extracted_data: null,
  ocr_confidence: null,
  parsing_confidence: null,
  requires_review: false,
  notes: null,
  created_at: "2025-03-01",
  updated_at: "2025-03-01",
};

describe("contract repo", () => {
  describe("getContractsByLandlord", () => {
    it("fetches contracts mapped to domain type", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({
            data: [{ ...mockContractRow, properties: { landlord_id: "l1" } }],
            error: null,
          }),
        }),
      });

      const result = await getContractsByLandlord("l1");
      expect(result).toHaveLength(1);
      expect(result[0].tenantName).toBe("홍길동");
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
        getContractsByLandlord("l1"),
      ).rejects.toThrow("Failed to fetch contracts");
    });
  });

  describe("getContractById", () => {
    it("returns contract when found", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: mockContractRow,
            error: null,
          }),
        }),
      });

      const result = await getContractById("c1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("c1");
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

      const result = await getContractById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("createContract", () => {
    it("creates contract and returns mapped object", async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: mockContractRow,
            error: null,
          }),
        }),
      });

      const result = await createContract({
        propertyId: "p1",
        tenantName: "홍길동",
        tenantPhone: "010-1234-5678",
        deposit: 50000000,
        monthlyRent: 500000,
        startDate: "2025-03-01",
        endDate: "2026-03-01",
        contractType: "월세",
        status: "active",
      });
      expect(result.id).toBe("c1");
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
        createContract({
          propertyId: "p1",
          tenantName: "test",
          tenantPhone: "010",
          deposit: 0,
          monthlyRent: 0,
          startDate: "2025-01-01",
          endDate: "2026-01-01",
          contractType: "월세",
          status: "draft",
        }),
      ).rejects.toThrow("Failed to create contract");
    });
  });

  describe("updateContractStatus", () => {
    it("updates status and returns updated contract", async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: { ...mockContractRow, status: "expiring_90" },
              error: null,
            }),
          }),
        }),
      });

      const result = await updateContractStatus("c1", "expiring_90");
      expect(result.status).toBe("expiring_90");
    });

    it("throws on update error", async () => {
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: null,
              error: { message: "Update failed" },
            }),
          }),
        }),
      });

      await expect(
        updateContractStatus("c1", "expiring_90"),
      ).rejects.toThrow("Failed to update contract status");
    });
  });

  describe("getExpiringContracts", () => {
    it("fetches contracts expiring within threshold days", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          lte: mockLte.mockReturnValue({
            gt: mockGt.mockResolvedValue({
              data: [mockContractRow],
              error: null,
            }),
          }),
        }),
      });

      const result = await getExpiringContracts("d90", 90);
      expect(result).toHaveLength(1);
    });

    it("throws on error", async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          lte: mockLte.mockReturnValue({
            gt: mockGt.mockResolvedValue({
              data: null,
              error: { message: "Query failed" },
            }),
          }),
        }),
      });

      await expect(
        getExpiringContracts("d90", 90),
      ).rejects.toThrow("Failed to fetch expiring contracts");
    });
  });
});
