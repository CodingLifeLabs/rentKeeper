import { getDashboardStats } from "@/service/dashboard";

jest.mock("@/repo/contract", () => ({
  getContractsByLandlord: jest.fn(),
}));

import { getContractsByLandlord } from "@/repo/contract";

const mockGetContracts = getContractsByLandlord as jest.MockedFunction<typeof getContractsByLandlord>;

describe("getDashboardStats", () => {
  it("returns zero stats when no contracts exist", async () => {
    mockGetContracts.mockResolvedValue([]);

    const stats = await getDashboardStats("landlord-1");

    expect(stats).toEqual({
      total: 0,
      active: 0,
      expiring: 0,
      expired: 0,
      vacancy: 0,
    });
  });

  it("counts contracts by status correctly", async () => {
    mockGetContracts.mockResolvedValue([
      { status: "active" } as never,
      { status: "active" } as never,
      { status: "expiring" } as never,
      { status: "expired" } as never,
      { status: "renewed" } as never,
      { status: "vacancy" } as never,
    ]);

    const stats = await getDashboardStats("landlord-1");

    expect(stats).toEqual({
      total: 6,
      active: 2,
      expiring: 1,
      expired: 2,
      vacancy: 1,
    });
  });

  it("returns only active contracts", async () => {
    mockGetContracts.mockResolvedValue([
      { status: "active" } as never,
      { status: "active" } as never,
      { status: "active" } as never,
    ]);

    const stats = await getDashboardStats("landlord-1");

    expect(stats.total).toBe(3);
    expect(stats.active).toBe(3);
    expect(stats.expiring).toBe(0);
  });
});
