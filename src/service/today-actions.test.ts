import { getMockTodayActions } from "./today-actions";
import { formatAuditAction, recordAudit, getAuditHistory } from "./audit-log";
import type { TodayAction } from "@/types/audit-log";

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
