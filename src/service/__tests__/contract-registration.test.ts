import { registerContract } from "@/service/contract-registration";
import type { ContractFormData } from "@/types/ocr";
import type { OcrResult } from "@/types/ocr";
import type { Contract } from "@/types/contract";

jest.mock("@/repo/contract", () => ({
  createContract: jest.fn(),
}));

import { createContract } from "@/repo/contract";

const mockCreateContract = createContract as jest.MockedFunction<
  typeof createContract
>;

const mockContract: Contract = {
  id: "contract-1",
  propertyId: "prop-1",
  tenantName: "김민수",
  tenantPhone: "010-1234-5678",
  deposit: 50000000,
  monthlyRent: 500000,
  startDate: "2025-03-01",
  endDate: "2026-02-28",
  contractType: "월세",
  status: "active",
  originalFileUrl: null,
  extractedData: null,
  ocrConfidence: 0.9,
  parsingConfidence: 0.9,
  requiresReview: false,
  notes: null,
  createdAt: "2025-03-01T00:00:00Z",
  updatedAt: "2025-03-01T00:00:00Z",
};

const baseFormData: ContractFormData = {
  propertyId: "prop-1",
  tenantName: "김민수",
  tenantPhone: "010-1234-5678",
  deposit: 50000000,
  monthlyRent: 500000,
  startDate: "2025-03-01",
  endDate: "2026-02-28",
  contractType: "월세",
  notes: null,
};

describe("registerContract", () => {
  it("creates contract with active status when OCR confidence is high", async () => {
    mockCreateContract.mockResolvedValue(mockContract);

    const ocrResult: OcrResult = {
      fields: [
        { key: "tenantName", label: "임차인", value: "김민수", confidence: 0.95 },
      ],
      overallConfidence: 0.95,
      rawText: "test",
      processingTimeMs: 100,
    };

    const result = await registerContract(baseFormData, ocrResult, null);

    expect(result).toEqual(mockContract);
    expect(mockCreateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "active",
        requiresReview: false,
      }),
    );
  });

  it("creates contract with draft status when OCR confidence is low", async () => {
    mockCreateContract.mockResolvedValue({
      ...mockContract,
      status: "draft",
      requiresReview: true,
    });

    const ocrResult: OcrResult = {
      fields: [
        { key: "tenantName", label: "임차인", value: "김민수", confidence: 0.5 },
      ],
      overallConfidence: 0.5,
      rawText: "test",
      processingTimeMs: 100,
    };

    const result = await registerContract(baseFormData, ocrResult, null);

    expect(result.status).toBe("draft");
    expect(mockCreateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "draft",
        requiresReview: true,
      }),
    );
  });

  it("creates contract without OCR result", async () => {
    mockCreateContract.mockResolvedValue(mockContract);

    const result = await registerContract(baseFormData, null, null);

    expect(result).toEqual(mockContract);
    expect(mockCreateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        ocrConfidence: null,
        parsingConfidence: null,
        requiresReview: false,
      }),
    );
  });
});
