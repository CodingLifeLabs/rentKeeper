import {
  determineFlowStep,
  getExpectedStep,
  advanceFlow,
  getFlowProgress,
  generateBenefitText,
} from "@/service/renewal-flow";
import type { RenewalFlowState } from "@/types/renewal-flow";

function makeState(
  overrides: Partial<RenewalFlowState> = {},
): RenewalFlowState {
  return {
    contractId: "test-contract",
    currentStep: "greeting",
    greetingSentAt: null,
    proposalSentAt: null,
    reminderSentAt: null,
    completedAt: null,
    ...overrides,
  };
}

describe("determineFlowStep", () => {
  it("returns greeting when more than 60 days left", () => {
    const end = "2026-12-31";
    const now = "2026-09-01";
    expect(determineFlowStep(end, now)).toBe("greeting");
  });

  it("returns proposal when 55 days left", () => {
    const end = "2026-12-31";
    const now = "2026-11-06";
    expect(determineFlowStep(end, now)).toBe("proposal");
  });

  it("returns reminder when 40 days left", () => {
    const end = "2026-12-31";
    const now = "2026-11-21";
    expect(determineFlowStep(end, now)).toBe("reminder");
  });

  it("returns completion when 20 days left", () => {
    const end = "2026-12-31";
    const now = "2026-12-11";
    expect(determineFlowStep(end, now)).toBe("completion");
  });
});

describe("advanceFlow", () => {
  it("advances from greeting to proposal", () => {
    const state = makeState({ greetingSentAt: "2026-09-01" });
    const next = advanceFlow(state, "proposal");
    expect(next.currentStep).toBe("proposal");
    expect(next.proposalSentAt).not.toBeNull();
  });

  it("does not go backwards", () => {
    const state = makeState({ currentStep: "reminder" });
    const next = advanceFlow(state, "greeting");
    expect(next.currentStep).toBe("reminder");
  });

  it("fills timestamps when advancing to completion", () => {
    const state = makeState({
      currentStep: "reminder",
      greetingSentAt: "2026-09-01",
      proposalSentAt: "2026-10-01",
      reminderSentAt: "2026-11-01",
    });
    const next = advanceFlow(state, "completion");
    expect(next.completedAt).not.toBeNull();
    expect(next.greetingSentAt).toBe("2026-09-01");
  });
});

describe("getFlowProgress", () => {
  it("returns 1 completed step for greeting", () => {
    const progress = getFlowProgress("greeting");
    expect(progress.completedSteps).toEqual(["greeting"]);
    expect(progress.totalSteps).toBe(4);
  });

  it("returns all 4 steps for completion", () => {
    const progress = getFlowProgress("completion");
    expect(progress.completedSteps).toHaveLength(4);
  });
});

describe("generateBenefitText", () => {
  it("includes broker fee savings", () => {
    const text = generateBenefitText(500000, 480000);
    expect(text).toContain("중개수수료");
    expect(text).toContain("이사 비용");
  });

  it("shows no rent change when rent is same", () => {
    const text = generateBenefitText(500000, 500000);
    expect(text).toContain("월세 변동 없음");
  });

  it("shows rent increase percentage", () => {
    const text = generateBenefitText(525000, 500000);
    expect(text).toContain("5.0%");
  });
});
