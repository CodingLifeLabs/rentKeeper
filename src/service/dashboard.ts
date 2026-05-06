import { getContractsByLandlord } from "@/repo/contract";
import type { Contract, ContractStatus } from "@/types";

export interface DashboardStats {
  total: number;
  active: number;
  expiring90: number;
  expiring30: number;
  negotiating: number;
  moveOutPending: number;
  vacant: number;
}

const INITIAL_COUNTS: Record<ContractStatus, number> = {
  draft: 0,
  active: 0,
  expiring_90: 0,
  expiring_30: 0,
  negotiating: 0,
  renewed: 0,
  move_out_pending: 0,
  vacant: 0,
  archived: 0,
};

export async function getDashboardStats(
  landlordId: string,
): Promise<DashboardStats> {
  const contracts = await getContractsByLandlord(landlordId);

  const counts = { ...INITIAL_COUNTS };

  for (const contract of contracts) {
    counts[contract.status] += 1;
  }

  return {
    total: contracts.length,
    active: counts.active,
    expiring90: counts.expiring_90,
    expiring30: counts.expiring_30,
    negotiating: counts.negotiating,
    moveOutPending: counts.move_out_pending,
    vacant: counts.vacant,
  };
}

export async function getRecentContracts(
  landlordId: string,
): Promise<Contract[]> {
  const contracts = await getContractsByLandlord(landlordId);
  return contracts.slice(0, 10);
}
