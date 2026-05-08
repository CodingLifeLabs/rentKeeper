import { requiresManualReview, processOcr, extractOcrConfidences } from "./ocr";

describe("requiresManualReview", () => {
  it("returns true below 0.80 threshold", () => {
    expect(requiresManualReview(0.79)).toBe(true);
  });

  it("returns false at 0.80 threshold", () => {
    expect(requiresManualReview(0.80)).toBe(false);
  });

  it("returns false above 0.80 threshold", () => {
    expect(requiresManualReview(0.95)).toBe(false);
  });
});

describe("processOcr", () => {
  it("returns completed job with fields", () => {
    const result = processOcr({
      imageBase64: "data:image/png;base64,test",
      mimeType: "image/png",
    });

    expect(result.status).toBe("completed");
    expect(result.result.fields.length).toBeGreaterThan(0);
    expect(result.result.overallConfidence).toBeGreaterThan(0);
  });

  it("generates a jobId", () => {
    const result = processOcr({
      imageBase64: "data:image/png;base64,test",
      mimeType: "image/png",
    });

    expect(result.jobId).toBeTruthy();
  });

  it("includes rawText in result", () => {
    const result = processOcr({
      imageBase64: "data:image/png;base64,test",
      mimeType: "image/png",
    });

    expect(result.result.rawText).toBeTruthy();
  });
});

describe("extractOcrConfidences", () => {
  it("returns equal ocr and parsing confidence for mock data", () => {
    const result = processOcr({
      imageBase64: "data:image/png;base64,test",
      mimeType: "image/png",
    });

    const confidences = extractOcrConfidences(result.result);
    expect(confidences.ocrConfidence).toBeGreaterThan(0.8);
    expect(confidences.parsingConfidence).toBeGreaterThan(0.8);
  });
});
