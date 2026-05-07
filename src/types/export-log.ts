export type ExportType = "csv" | "xlsx" | "zip";

export interface ExportLog {
  id: string;
  landlordId: string;
  exportType: ExportType;
  exportedAt: string;
  rowCount: number;
  includePhone: boolean;
}

export interface ExportLogInsert {
  landlordId: string;
  exportType: ExportType;
  rowCount: number;
  includePhone: boolean;
}
