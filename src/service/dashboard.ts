import { getContractsByLandlord } from "@/repo/contract";
import type { Contract, ContractStatus } from "@/types";

export interface DashboardStats {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  vacancy: number;
}

export async function getDashboardStats(landlordId: string): Promise<DashboardStats> {
  const contracts = await getContractsByLandlord(landlordId);

  const counts: Record<ContractStatus, number> = {
    active: 0,
    expiring: 0,
    expired: 0,
    renewed: 0,
    vacancy: 0,
  };

  for (const contract of contracts) {
    counts[contract.status] += 1;
  }

  return {
    total: contracts.length,
    active: counts.active,
    expiring: counts.expiring,
    expired: counts.expired + counts.renewed,
    vacancy: counts.vacancy,
  };
}

export async function getRecentContracts(landlordId: string): Promise<Contract[]> {
  const contracts = await getContractsByLandlord(landlordId);
  return contracts.slice(0, 10);
}
