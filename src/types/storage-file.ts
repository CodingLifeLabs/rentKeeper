export interface StorageFile {
  id: string;
  contractId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedAt: string;
}

export interface StorageFileInsert {
  contractId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
}

export interface ContractUpdate {
  tenantName?: string;
  tenantPhone?: string;
  deposit?: number;
  monthlyRent?: number | null;
  startDate?: string;
  endDate?: string;
  notes?: string | null;
}
