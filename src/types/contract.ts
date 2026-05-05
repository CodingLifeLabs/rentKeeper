export type ContractType = "월세" | "전세";
export type ContractStatus = "active" | "expiring" | "expired" | "renewed" | "vacancy";

export interface Contract {
  id: string;
  propertyId: string;
  tenantName: string;
  tenantPhone: string;
  deposit: number;
  monthlyRent: number | null;
  startDate: string;
  endDate: string;
  contractType: ContractType;
  status: ContractStatus;
  originalFileUrl: string | null;
  extractedData: Record<string, unknown> | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractInsert {
  propertyId: string;
  tenantName: string;
  tenantPhone: string;
  deposit: number;
  monthlyRent: number | null;
  startDate: string;
  endDate: string;
  contractType: ContractType;
  status: ContractStatus;
  originalFileUrl?: string | null;
  extractedData?: Record<string, unknown> | null;
  notes?: string | null;
}
