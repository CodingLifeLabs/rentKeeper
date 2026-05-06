export interface OcrField {
  key: string;
  label: string;
  value: string;
  confidence: number;
}

export interface OcrResult {
  fields: OcrField[];
  overallConfidence: number;
  rawText: string;
  processingTimeMs: number;
}

export interface OcrJobRequest {
  imageUrl: string;
  fileName: string;
}

export interface OcrJobResult {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  result: OcrResult | null;
  error: string | null;
}

export interface ContractFormData {
  propertyId: string;
  tenantName: string;
  tenantPhone: string;
  deposit: number;
  monthlyRent: number | null;
  startDate: string;
  endDate: string;
  contractType: "월세" | "전세";
  notes: string | null;
}
