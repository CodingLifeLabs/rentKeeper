import type { Plan, PlanTier } from "@/types/billing";

// Server-only product IDs — never expose via NEXT_PUBLIC
const POLAR_PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID ?? "";
const POLAR_BUSINESS_PRODUCT_ID = process.env.POLAR_BUSINESS_PRODUCT_ID ?? "";

const PLANS: Record<PlanTier, Plan> = {
  free: {
    tier: "free",
    name: "Free",
    price: 0,
    currency: "KRW",
    interval: "month",
    limits: {
      maxContracts: 3,
      ocrEnabled: false,
      storageGB: 0.5,
      renewalProposals: false,
      communicationHistory: false,
      customBranding: false,
    },
    features: [
      "계약 최대 3건 등록",
      "만기 알림 (D-90, D-30)",
      "기본 대시보드",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    price: 9900,
    currency: "KRW",
    interval: "month",
    limits: {
      maxContracts: 20,
      ocrEnabled: true,
      storageGB: 5,
      renewalProposals: true,
      communicationHistory: true,
      customBranding: false,
    },
    features: [
      "계약 최대 20건 등록",
      "OCR 계약서 자동 추출",
      "갱신 제안서 발송",
      "커뮤니케이션 이력",
      "만기 알림 (D-90, D-60, D-30, D-7)",
      "5GB 보관함",
    ],
    polarProductId: POLAR_PRO_PRODUCT_ID,
    polarPriceId: process.env.POLAR_PRO_PRICE_ID,
  },
  business: {
    tier: "business",
    name: "Business",
    price: 24900,
    currency: "KRW",
    interval: "month",
    limits: {
      maxContracts: 100,
      ocrEnabled: true,
      storageGB: 50,
      renewalProposals: true,
      communicationHistory: true,
      customBranding: true,
    },
    features: [
      "계약 최대 100건 등록",
      "OCR 계약서 자동 추출",
      "갱신 제안서 발송",
      "커뮤니케이션 이력",
      "만기 알림 전 채널",
      "50GB 보관함",
      "커스텀 브랜딩",
      "우선 지원",
    ],
    polarProductId: POLAR_BUSINESS_PRODUCT_ID,
    polarPriceId: process.env.POLAR_BUSINESS_PRICE_ID,
  },
};

export function getPlan(tier: PlanTier): Plan {
  return PLANS[tier];
}

export function getAllPlans(): Plan[] {
  return Object.values(PLANS);
}

export function getPlanLimits(tier: PlanTier) {
  return PLANS[tier].limits;
}

/** Maps a Polar productId to its PlanTier using a server-side whitelist.
 *  Returns null when the productId is unknown (e.g. test products, other orgs). */
export function getTierByProductId(productId: string): PlanTier | null {
  if (POLAR_PRO_PRODUCT_ID && productId === POLAR_PRO_PRODUCT_ID) return "pro";
  if (POLAR_BUSINESS_PRODUCT_ID && productId === POLAR_BUSINESS_PRODUCT_ID) return "business";
  return null;
}

export const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN ?? "";
export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET ?? "";
export const POLAR_SERVER = (process.env.POLAR_SERVER ?? "sandbox") as "sandbox" | "production";
