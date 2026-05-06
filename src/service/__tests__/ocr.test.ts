import {
  processOcr,
  requiresManualReview,
  extractOcrConfidences,
} from "@/service/ocr";
import type { OcrJobRequest } from "@/types/ocr";

const mockRequest: OcrJobRequest = {
  imageUrl: "data:image/jpeg;base64,test",
  fileName: "contract.jpg",
};

describe("processOcr", () => {
  it("returns completed result with fields", () => {
    const result = processOcr(mockRequest);

    expect(result.status).toBe("completed");
    expect(result.jobId).toBeTruthy();
    expect(result.error).toBeNull();
    expect(result.result).not.toBeNull();
    expect(result.result!.fields.length).toBeGreaterThan(0);
  });

  it("computes overall confidence from fields", () => {
    const result = processOcr(mockRequest);

    expect(result.result!.overallConfidence).toBeGreaterThan(0);
    expect(result.result!.overallConfidence).toBeLessThanOrEqual(1);
  });

  it("includes raw text and processing time", () => {
    const result = processOcr(mockRequest);

    expect(result.result!.rawText).toBeTruthy();
    expect(result.result!.processingTimeMs).toBeGreaterThan(0);
  });
});

describe("requiresManualReview", () => {
  it("returns true when confidence is below 0.80", () => {
    expect(requiresManualReview(0.65)).toBe(true);
    expect(requiresManualReview(0.79)).toBe(true);
  });

  it("returns false when confidence is 0.80 or above", () => {
    expect(requiresManualReview(0.80)).toBe(false);
    expect(requiresManualReview(0.95)).toBe(false);
  });
});

describe("extractOcrConfidences", () => {
  it("extracts ocr and parsing confidence from result", () => {
    const result = processOcr(mockRequest);
    const confidences = extractOcrConfidences(result.result!);

    expect(confidences.ocrConfidence).toBeGreaterThan(0);
    expect(confidences.parsingConfidence).toBeGreaterThan(0);
  });

  it("returns same confidence when all fields have same value", () => {
    const result = processOcr(mockRequest);
    const confidences = extractOcrConfidences(result.result!);

    expect(confidences.ocrConfidence).toBe(
      result.result!.overallConfidence,
    );
  });
});
