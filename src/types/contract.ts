export type ContractType = "월세" | "전세";
export type ContractStatus =
  | "draft"
  | "active"
  | "expiring_90"
  | "expiring_30"
  | "negotiating"
  | "renewed"
  | "move_out_pending"
  | "vacant"
  | "archived";

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
  ocrConfidence: number | null;
  parsingConfidence: number | null;
  requiresReview: boolean;
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
  ocrConfidence?: number | null;
  parsingConfidence?: number | null;
  requiresReview?: boolean;
  notes?: string | null;
}
