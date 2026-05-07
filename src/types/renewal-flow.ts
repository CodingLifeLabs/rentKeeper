export type RenewalFlowStep = "greeting" | "proposal" | "reminder" | "completion";

export interface RenewalFlowState {
  contractId: string;
  currentStep: RenewalFlowStep;
  greetingSentAt: string | null;
  proposalSentAt: string | null;
  reminderSentAt: string | null;
  completedAt: string | null;
}

export const FLOW_STEP_LABELS: Record<RenewalFlowStep, string> = {
  greeting: "안부 발송 (D-90)",
  proposal: "갱신 제안 (D-60)",
  reminder: "리마인드 (D-45)",
  completion: "완료 (D-30)",
};

export const MESSAGE_GUIDELINES = {
  greeting: {
    placeholder: "안녕하세요! 그동안 편하게 거주하셨기를 바랍니다. 곧 계약 만기가 다가오고 있어 연락드렸습니다.",
    tips: [
      "따뜻한 인사로 시작하세요",
      "이사 부담을 덜어주는 뉘앙스를 주세요",
      "구체적인 조건은 아직 언급하지 마세요",
    ],
  },
  proposal: {
    placeholder: "저희가 제안드리는 갱신 조건입니다. 이사 없이 계속 거주하시면 중개비와 이사 비용을 절약하실 수 있습니다.",
    tips: [
      "혜택(중개비 절약 등)을 먼저 언급하세요",
      "인상율 5% 이하인지 확인하세요",
      "타협 여지를 열어두세요",
    ],
  },
  reminder: {
    placeholder: "이전에 보내드린 갱신 제안 확인해보셨는지요? 기한이 가까워지고 있어 다시 연락드립니다.",
    tips: [
      "재촉하는 느낌을 피하세요",
      "마감일을 부드럽게 상기시키세요",
      "질문이 있으면 연락 달라고 하세요",
    ],
  },
} as const;
