import { createContract } from "@/repo/contract";
import { getPropertiesByLandlord } from "@/repo/property";
import type { Contract, ContractFormData } from "@/types";
import type { OcrResult } from "@/types/ocr";
import { extractOcrConfidences, requiresManualReview } from "./ocr";

export async function registerContract(
  formData: ContractFormData,
  ocrResult: OcrResult | null,
  originalFileUrl: string | null,
): Promise<Contract> {
  const { ocrConfidence, parsingConfidence } = ocrResult
    ? extractOcrConfidences(ocrResult)
    : { ocrConfidence: null, parsingConfidence: null };

  const needsReview = ocrResult
    ? requiresManualReview(ocrResult.overallConfidence)
    : false;

  const contract = await createContract({
    propertyId: formData.propertyId,
    tenantName: formData.tenantName,
    tenantPhone: formData.tenantPhone,
    deposit: formData.deposit,
    monthlyRent: formData.monthlyRent,
    startDate: formData.startDate,
    endDate: formData.endDate,
    contractType: formData.contractType,
    status: needsReview ? "draft" : "active",
    originalFileUrl,
    extractedData: ocrResult
      ? { fields: ocrResult.fields, rawText: ocrResult.rawText }
      : null,
    ocrConfidence,
    parsingConfidence,
    requiresReview: needsReview,
    notes: formData.notes,
  });

  return contract;
}

export async function getPropertiesForLandlord(
  landlordId: string,
) {
  return getPropertiesByLandlord(landlordId);
}
