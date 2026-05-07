import type { RenewalFlowStep, RenewalFlowState } from "@/types/renewal-flow";

const STEP_ORDER: RenewalFlowStep[] = ["greeting", "proposal", "reminder", "completion"];

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return Math.ceil((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
}

export function determineFlowStep(
  contractEndDate: string,
  now: string = new Date().toISOString(),
): RenewalFlowStep {
  const daysLeft = daysBetween(contractEndDate, now);

  if (daysLeft <= 30) return "completion";
  if (daysLeft <= 45) return "reminder";
  if (daysLeft <= 60) return "proposal";
  return "greeting";
}

export function getExpectedStep(daysBeforeExpiry: number): RenewalFlowStep {
  if (daysBeforeExpiry <= 30) return "completion";
  if (daysBeforeExpiry <= 45) return "reminder";
  if (daysBeforeExpiry <= 60) return "proposal";
  return "greeting";
}

export function advanceFlow(
  state: RenewalFlowState,
  step: RenewalFlowStep,
): RenewalFlowState {
  const currentIdx = STEP_ORDER.indexOf(state.currentStep);
  const nextIdx = STEP_ORDER.indexOf(step);

  if (nextIdx <= currentIdx) return state;

  const now = new Date().toISOString();
  return {
    ...state,
    currentStep: step,
    greetingSentAt: step === "greeting" || currentIdx >= 0 ? (state.greetingSentAt ?? now) : state.greetingSentAt,
    proposalSentAt: step === "proposal" || currentIdx >= 1 ? (state.proposalSentAt ?? now) : state.proposalSentAt,
    reminderSentAt: step === "reminder" || currentIdx >= 2 ? (state.reminderSentAt ?? now) : state.reminderSentAt,
    completedAt: step === "completion" ? (state.completedAt ?? now) : state.completedAt,
  };
}

export function getFlowProgress(currentStep: RenewalFlowStep): {
  completedSteps: RenewalFlowStep[];
  totalSteps: number;
} {
  const idx = STEP_ORDER.indexOf(currentStep);
  return {
    completedSteps: STEP_ORDER.slice(0, idx + 1),
    totalSteps: STEP_ORDER.length,
  };
}

export function generateBenefitText(
  proposedRent: number,
  currentRent: number,
  areaSqM?: number,
): string {
  const increase = proposedRent - currentRent;
  const increasePct = currentRent > 0 ? ((increase / currentRent) * 100).toFixed(1) : "0";

  const lines: string[] = [];

  lines.push("이사 없이 거주하시면");

  const brokerFee = Math.round(proposedRent * 0.5);
  lines.push(`• 중개수수료 약 ${brokerFee.toLocaleString()}원 절약`);

  lines.push("• 이사 비용 100~300만원 절약");
  lines.push("• 새로운 계약서 작성 불필요");

  if (increase <= 0) {
    lines.push(`• 월세 변동 없음`);
  } else {
    lines.push(`• 월세 인상 ${increasePct}% (월 ${increase.toLocaleString()}원)`);
  }

  return lines.join("\n");
}
