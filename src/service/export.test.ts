import { generateCsv, generateXlsx, getExportFilename } from "@/service/export";
import type { Contract } from "@/types/contract";

function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "test-id",
    propertyId: "prop-1",
    tenantName: "홍길동",
    tenantPhone: "010-1234-5678",
    deposit: 50000000,
    monthlyRent: 500000,
    startDate: "2025-01-01",
    endDate: "2026-01-01",
    contractType: "월세",
    status: "active",
    originalFileUrl: null,
    extractedData: null,
    ocrConfidence: null,
    parsingConfidence: null,
    requiresReview: false,
    notes: null,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("generateCsv", () => {
  it("generates CSV with BOM and Korean headers", () => {
    const contracts = [makeContract()];
    const csv = generateCsv(contracts, false);

    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("호수");
    expect(csv).toContain("임차인명");
    expect(csv).toContain("홍길동");
  });

  it("masks phone when includePhone is false", () => {
    const contracts = [makeContract({ tenantPhone: "010-1234-5678" })];
    const csv = generateCsv(contracts, false);

    expect(csv).toContain("010-****-5678");
    expect(csv).not.toContain("010-1234-5678");
  });

  it("includes full phone when includePhone is true", () => {
    const contracts = [makeContract({ tenantPhone: "010-1234-5678" })];
    const csv = generateCsv(contracts, true);

    expect(csv).toContain("010-1234-5678");
  });

  it("maps status to Korean labels", () => {
    const contracts = [makeContract({ status: "expiring_90" })];
    const csv = generateCsv(contracts, false);

    expect(csv).toContain("D-90 만기");
  });

  it("escapes values with commas", () => {
    const contracts = [makeContract({ tenantName: "김,이름" })];
    const csv = generateCsv(contracts, false);

    expect(csv).toContain('"김,이름"');
  });
});

describe("generateXlsx", () => {
  it("generates an Excel buffer with multiple sheets", async () => {
    const contracts = [
      makeContract(),
      makeContract({ id: "exp-1", status: "expiring_90" }),
      makeContract({ id: "vac-1", status: "vacant", monthlyRent: null }),
    ];

    const buffer = await generateXlsx(contracts, true);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});

describe("getExportFilename", () => {
  it("generates CSV filename with date", () => {
    const name = getExportFilename("csv");
    expect(name).toMatch(/^rentkeeper_계약목록_\d{8}\.csv$/);
  });

  it("generates XLSX filename with date", () => {
    const name = getExportFilename("xlsx");
    expect(name).toMatch(/^rentkeeper_운영현황_\d{8}\.xlsx$/);
  });
});
