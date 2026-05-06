import type { Plan, PlanTier } from "@/types/billing";

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
    polarProductId: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID,
    polarPriceId: process.env.NEXT_PUBLIC_POLAR_PRO_PRICE_ID,
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
    polarProductId: process.env.NEXT_PUBLIC_POLAR_BUSINESS_PRODUCT_ID,
    polarPriceId: process.env.NEXT_PUBLIC_POLAR_BUSINESS_PRICE_ID,
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

export const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN ?? "";
export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET ?? "";
export const POLAR_SERVER = (process.env.POLAR_SERVER ?? "sandbox") as "sandbox" | "production";
