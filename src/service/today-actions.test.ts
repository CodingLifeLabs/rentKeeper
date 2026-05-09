import { jest } from "@jest/globals";

jest.mock("@/repo/contract", () => ({
  getContractsByLandlord: jest.fn(),
}));
jest.mock("@/repo/renewal-proposal", () => ({
  getProposalsByContract: jest.fn(),
}));

import { getTodayActions, getMockTodayActions } from "./today-actions";
import { getContractsByLandlord } from "@/repo/contract";
import { getProposalsByContract } from "@/repo/renewal-proposal";
import { formatAuditAction } from "./audit-log";
import type { TodayAction } from "@/types/audit-log";
import type { Contract } from "@/types/contract";

const mockGetContracts = getContractsByLandlord as jest.Mock;
const mockGetProposals = getProposalsByContract as jest.Mock;

function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "c-1",
    propertyId: "p-1",
    tenantName: "홍길동",
    tenantPhone: "010-0000-0000",
    deposit: 10000000,
    monthlyRent: 500000,
    startDate: "2023-01-01",
    endDate: "2099-01-01",
    contractType: "월세",
    status: "active",
    originalFileUrl: null,
    extractedData: null,
    ocrConfidence: null,
    parsingConfidence: null,
    requiresReview: false,
    notes: null,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("formatAuditAction", () => {
  it("returns Korean labels for known actions", () => {
    expect(formatAuditAction("export_csv")).toBe("CSV 내보내기");
    expect(formatAuditAction("proposal_sent")).toBe("제안서 발송");
    expect(formatAuditAction("login")).toBe("로그인");
  });

  it("returns raw action string for unknown actions", () => {
    expect(formatAuditAction("unknown_action" as never)).toBe("unknown_action");
  });
});

describe("getMockTodayActions", () => {
  it("returns 3 mock actions", () => {
    const actions = getMockTodayActions();
    expect(actions).toHaveLength(3);
  });

  it("includes all 3 action types", () => {
    const actions = getMockTodayActions();
    const types = actions.map((a) => a.type);
    expect(types).toContain("expiring_soon");
    expect(types).toContain("no_response");
    expect(types).toContain("renewal_contact");
  });

  it("has valid urgency levels", () => {
    const actions = getMockTodayActions();
    for (const action of actions) {
      expect(["high", "medium", "low"]).toContain(action.urgency);
    }
  });

  it("sorts by urgency (high first)", () => {
    const actions = getMockTodayActions();
    expect(actions[0].urgency).toBe("high");
    expect(actions[actions.length - 1].urgency).toBe("low");
  });

  it("all actions have required fields", () => {
    const actions = getMockTodayActions();
    for (const action of actions) {
      expect(action.id).toBeTruthy();
      expect(action.label).toBeTruthy();
      expect(action.description).toBeTruthy();
      expect(action.contractId).toBeTruthy();
      expect(action.tenantName).toBeTruthy();
    }
  });
});

describe("getTodayActions", () => {
  const NOW = new Date("2026-01-01T00:00:00Z");

  function makeProposal(overrides: Partial<{
    id: string; contractId: string; status: string; sentAt: string;
    proposedRent: number; proposedDeposit: number; message: null;
    shareToken: string; respondedAt: null; createdAt: string;
  }> = {}) {
    return {
      id: "p-1",
      contractId: "c-1",
      proposedRent: 500000,
      proposedDeposit: 10000000,
      message: null,
      shareToken: "tok-1",
      status: "sent",
      sentAt: "2026-01-01T00:00:00Z",
      respondedAt: null,
      createdAt: "2025-12-01T00:00:00Z",
      ...overrides,
    };
  }

  beforeEach(() => {
    mockGetContracts.mockReset();
    mockGetProposals.mockReset();
  });

  it("returns empty array when there are no contracts", async () => {
    mockGetContracts.mockResolvedValue([]);
    const result = await getTodayActions("ll-1", NOW);
    expect(result).toEqual([]);
  });

  it("returns empty array when contract is far from expiry (>60 days)", async () => {
    const contract = makeContract({
      endDate: "2026-04-01T00:00:00Z", // 90 days away
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([]);
    const result = await getTodayActions("ll-1", NOW);
    expect(result).toEqual([]);
  });

  it("returns expiring_soon high urgency for contract ≤30 days out", async () => {
    const contract = makeContract({
      id: "c-25",
      tenantName: "홍길동",
      endDate: "2026-01-26T00:00:00Z", // 25 days away
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([]);
    const result = await getTodayActions("ll-1", NOW);
    const expiring = result.find((a) => a.type === "expiring_soon");
    expect(expiring).toBeDefined();
    expect(expiring!.urgency).toBe("high");
    expect(expiring!.daysUntil).toBe(25);
    expect(expiring!.tenantName).toBe("홍길동");
  });

  it("returns expiring_soon medium urgency for contract 31–45 days out", async () => {
    const contract = makeContract({
      id: "c-40",
      endDate: "2026-02-10T00:00:00Z", // 40 days away
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([]);
    const result = await getTodayActions("ll-1", NOW);
    const expiring = result.find((a) => a.type === "expiring_soon");
    expect(expiring).toBeDefined();
    expect(expiring!.urgency).toBe("medium");
    expect(expiring!.daysUntil).toBe(40);
  });

  it("returns expiring_soon low urgency for contract 46–60 days out", async () => {
    const contract = makeContract({
      id: "c-55",
      endDate: "2026-02-25T00:00:00Z", // 55 days away
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([]);
    const result = await getTodayActions("ll-1", NOW);
    const expiring = result.find((a) => a.type === "expiring_soon");
    expect(expiring).toBeDefined();
    expect(expiring!.urgency).toBe("low");
  });

  it("returns no_response when sent proposal exists and daysSinceSent ≥ 7", async () => {
    const contract = makeContract({
      id: "c-50",
      tenantName: "김철수",
      endDate: "2026-02-20T00:00:00Z", // 50 days — no expiring_soon added (>30 days, no proposal yet triggers renewal)
    });
    const proposal = makeProposal({
      id: "p-10",
      status: "sent",
      sentAt: "2025-12-24T00:00:00Z", // 8 days ago
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([proposal]);
    const result = await getTodayActions("ll-1", NOW);
    const noResp = result.find((a) => a.type === "no_response");
    expect(noResp).toBeDefined();
    expect(noResp!.daysSinceSent).toBe(8);
    expect(noResp!.tenantName).toBe("김철수");
    expect(noResp!.urgency).toBe("medium");
  });

  it("returns no_response high urgency when daysSinceSent ≥ 14", async () => {
    const contract = makeContract({
      id: "c-50b",
      endDate: "2026-02-20T00:00:00Z",
    });
    const proposal = makeProposal({
      status: "sent",
      sentAt: "2025-12-17T00:00:00Z", // 15 days ago
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([proposal]);
    const result = await getTodayActions("ll-1", NOW);
    const noResp = result.find((a) => a.type === "no_response");
    expect(noResp).toBeDefined();
    expect(noResp!.urgency).toBe("high");
  });

  it("does NOT return no_response when daysSinceSent < 7", async () => {
    const contract = makeContract({
      id: "c-50c",
      endDate: "2026-02-20T00:00:00Z",
    });
    const proposal = makeProposal({
      status: "sent",
      sentAt: "2025-12-29T00:00:00Z", // 3 days ago
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([proposal]);
    const result = await getTodayActions("ll-1", NOW);
    const noResp = result.find((a) => a.type === "no_response");
    expect(noResp).toBeUndefined();
  });

  it("returns renewal_contact when no sent proposal and 30 < daysUntil ≤ 60", async () => {
    const contract = makeContract({
      id: "c-50d",
      tenantName: "이영희",
      endDate: "2026-02-20T00:00:00Z", // 50 days
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([]); // no proposals
    const result = await getTodayActions("ll-1", NOW);
    const renewal = result.find((a) => a.type === "renewal_contact");
    expect(renewal).toBeDefined();
    expect(renewal!.tenantName).toBe("이영희");
    expect(renewal!.urgency).toBe("low");
  });

  it("does NOT return renewal_contact when daysUntil ≤ 30", async () => {
    const contract = makeContract({
      id: "c-25b",
      endDate: "2026-01-26T00:00:00Z", // 25 days
    });
    mockGetContracts.mockResolvedValue([contract]);
    mockGetProposals.mockResolvedValue([]);
    const result = await getTodayActions("ll-1", NOW);
    const renewal = result.find((a) => a.type === "renewal_contact");
    expect(renewal).toBeUndefined();
  });

  it("ignores contracts with non-active statuses", async () => {
    const contract = makeContract({
      id: "c-archived",
      status: "archived",
      endDate: "2026-01-26T00:00:00Z", // 25 days
    });
    mockGetContracts.mockResolvedValue([contract]);
    const result = await getTodayActions("ll-1", NOW);
    expect(result).toEqual([]);
    expect(mockGetProposals).not.toHaveBeenCalled();
  });

  it("sorts results with high urgency first", async () => {
    const c1 = makeContract({ id: "c-a", endDate: "2026-01-26T00:00:00Z" }); // 25d, high expiring_soon
    const c2 = makeContract({ id: "c-b", endDate: "2026-02-10T00:00:00Z" }); // 40d, medium expiring_soon
    mockGetContracts.mockResolvedValue([c2, c1]); // deliberately reversed
    mockGetProposals.mockResolvedValue([]);
    const result = await getTodayActions("ll-1", NOW);
    expect(result[0].urgency).toBe("high");
    expect(result[result.length - 1].urgency).not.toBe("high");
  });
});

describe("TodayAction type structure", () => {
  it("expiring_soon has daysUntil", () => {
    const action: TodayAction = {
      id: "test-1",
      type: "expiring_soon",
      label: "만기 임박",
      description: "테스트",
      contractId: "c-1",
      tenantName: "테스트",
      daysUntil: 25,
      urgency: "high",
    };
    expect(action.daysUntil).toBe(25);
    expect(action.daysSinceSent).toBeUndefined();
  });

  it("no_response has daysSinceSent", () => {
    const action: TodayAction = {
      id: "test-2",
      type: "no_response",
      label: "응답 없음",
      description: "테스트",
      contractId: "c-2",
      tenantName: "테스트",
      daysSinceSent: 8,
      urgency: "medium",
    };
    expect(action.daysSinceSent).toBe(8);
    expect(action.daysUntil).toBeUndefined();
  });
});
