import type { RentCalculation } from "@/types/calculator";

const LEGAL_MAX_RATE = 0.05;
const LEGAL_REFERENCE =
  "주택임대차보호법 제7조의2 (차임증감청구권의 제한) — 임대인은 약정한 차임의 20분의 1의 금액을 초과하여 차임의 증액을 청구하지 못한다.";

export function calculateRent(
  currentRent: number,
  proposedRent: number,
  deposit: number,
): RentCalculation {
  const increaseRate =
    currentRent > 0 ? (proposedRent - currentRent) / currentRent : 0;

  return {
    currentRent,
    proposedRent,
    increaseRate: Math.round(increaseRate * 10000) / 10000,
    legalMaxRate: LEGAL_MAX_RATE,
    isLegal: increaseRate <= LEGAL_MAX_RATE,
    deposit,
    legalReference: LEGAL_REFERENCE,
  };
}

export function calculateLegalMaxRent(currentRent: number): number {
  return Math.round(currentRent * (1 + LEGAL_MAX_RATE));
}
