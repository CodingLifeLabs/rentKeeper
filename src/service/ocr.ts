import type { OcrField, OcrJobRequest, OcrJobResult, OcrResult } from "@/types/ocr";

const MOCK_FIELDS: OcrField[] = [
  { key: "tenantName", label: "임차인", value: "김민수", confidence: 0.95 },
  { key: "tenantPhone", label: "임차인 연락처", value: "010-1234-5678", confidence: 0.88 },
  { key: "deposit", label: "보증금", value: "50000000", confidence: 0.92 },
  { key: "monthlyRent", label: "월세", value: "500000", confidence: 0.90 },
  { key: "startDate", label: "계약시작일", value: "2025-03-01", confidence: 0.85 },
  { key: "endDate", label: "계약종료일", value: "2026-02-28", confidence: 0.85 },
  { key: "contractType", label: "계약유형", value: "월세", confidence: 0.97 },
  { key: "address", label: "임대물", value: "서울시 강남구 역삼로 123", confidence: 0.82 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars

function computeOverallConfidence(fields: OcrField[]): number {
  if (fields.length === 0) return 0;
  const sum = fields.reduce((acc, f) => acc + f.confidence, 0);
  return Math.round((sum / fields.length) * 1000) / 1000;
}

function mockProcessImage(_request: OcrJobRequest): OcrResult {
  const overallConfidence = computeOverallConfidence(MOCK_FIELDS);
  return {
    fields: MOCK_FIELDS,
    overallConfidence,
    rawText: "임대차계약서\n임차인: 김민수\n보증금: 오천만원\n월세: 오십만원",
    processingTimeMs: 1200,
  };
}

const REVIEW_THRESHOLD = 0.80;

export function requiresManualReview(overallConfidence: number): boolean {
  return overallConfidence < REVIEW_THRESHOLD;
}

export function processOcr(request: OcrJobRequest): OcrJobResult {
  const result = mockProcessImage(request);
  return {
    jobId: crypto.randomUUID(),
    status: "completed",
    result,
    error: null,
  };
}

export function extractOcrConfidences(
  result: OcrResult,
): { ocrConfidence: number; parsingConfidence: number } {
  return {
    ocrConfidence: result.overallConfidence,
    parsingConfidence: computeOverallConfidence(result.fields),
  };
}
