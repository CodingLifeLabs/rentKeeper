import { getDashboardStats } from "@/service/dashboard";

jest.mock("@/repo/contract", () => ({
  getContractsByLandlord: jest.fn(),
}));

import { getContractsByLandlord } from "@/repo/contract";

const mockGetContracts = getContractsByLandlord as jest.MockedFunction<
  typeof getContractsByLandlord
>;

describe("getDashboardStats", () => {
  it("returns zero stats when no contracts exist", async () => {
    mockGetContracts.mockResolvedValue([]);

    const stats = await getDashboardStats("landlord-1");

    expect(stats).toEqual({
      total: 0,
      active: 0,
      expiring90: 0,
      expiring30: 0,
      negotiating: 0,
      moveOutPending: 0,
      vacant: 0,
    });
  });

  it("counts contracts by status correctly", async () => {
    mockGetContracts.mockResolvedValue([
      { status: "active" } as never,
      { status: "active" } as never,
      { status: "expiring_90" } as never,
      { status: "expiring_30" } as never,
      { status: "negotiating" } as never,
      { status: "move_out_pending" } as never,
      { status: "vacant" } as never,
      { status: "draft" } as never,
      { status: "renewed" } as never,
      { status: "archived" } as never,
    ]);

    const stats = await getDashboardStats("landlord-1");

    expect(stats).toEqual({
      total: 10,
      active: 2,
      expiring90: 1,
      expiring30: 1,
      negotiating: 1,
      moveOutPending: 1,
      vacant: 1,
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
    expect(stats.expiring90).toBe(0);
    expect(stats.expiring30).toBe(0);
    expect(stats.negotiating).toBe(0);
    expect(stats.moveOutPending).toBe(0);
    expect(stats.vacant).toBe(0);
  });

  it("handles all v3.0 statuses independently", async () => {
    mockGetContracts.mockResolvedValue([
      { status: "draft" } as never,
      { status: "expiring_90" } as never,
      { status: "expiring_30" } as never,
      { status: "negotiating" } as never,
      { status: "renewed" } as never,
      { status: "move_out_pending" } as never,
      { status: "vacant" } as never,
      { status: "archived" } as never,
    ]);

    const stats = await getDashboardStats("landlord-1");

    expect(stats.total).toBe(8);
    expect(stats.active).toBe(0);
    expect(stats.expiring90).toBe(1);
    expect(stats.expiring30).toBe(1);
    expect(stats.negotiating).toBe(1);
    expect(stats.moveOutPending).toBe(1);
    expect(stats.vacant).toBe(1);
  });
});
