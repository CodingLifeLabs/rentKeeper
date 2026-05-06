import { canTransition, transitionContract } from "@/service/state-machine";

describe("state-machine", () => {
  describe("canTransition", () => {
    it("allows draft → active", () => {
      expect(canTransition("draft", "active")).toBe(true);
    });

    it("allows active → expiring_90", () => {
      expect(canTransition("active", "expiring_90")).toBe(true);
    });

    it("allows expiring_90 → expiring_30", () => {
      expect(canTransition("expiring_90", "expiring_30")).toBe(true);
    });

    it("allows expiring_30 → negotiating", () => {
      expect(canTransition("expiring_30", "negotiating")).toBe(true);
    });

    it("allows expiring_30 → move_out_pending", () => {
      expect(canTransition("expiring_30", "move_out_pending")).toBe(true);
    });

    it("allows negotiating → renewed", () => {
      expect(canTransition("negotiating", "renewed")).toBe(true);
    });

    it("allows renewed → active", () => {
      expect(canTransition("renewed", "active")).toBe(true);
    });

    it("allows move_out_pending → vacant", () => {
      expect(canTransition("move_out_pending", "vacant")).toBe(true);
    });

    it("allows vacant → active", () => {
      expect(canTransition("vacant", "active")).toBe(true);
    });

    it("allows vacant → archived", () => {
      expect(canTransition("vacant", "archived")).toBe(true);
    });

    it("rejects invalid transition: draft → vacant", () => {
      expect(canTransition("draft", "vacant")).toBe(false);
    });

    it("rejects invalid transition: active → negotiating", () => {
      expect(canTransition("active", "negotiating")).toBe(false);
    });

    it("rejects same-state transition", () => {
      expect(canTransition("active", "active")).toBe(false);
    });
  });

  describe("transitionContract", () => {
    it("returns target status on valid transition", () => {
      expect(transitionContract("draft", "active")).toBe("active");
    });

    it("returns target status for expiring path", () => {
      expect(transitionContract("active", "expiring_90")).toBe("expiring_90");
      expect(transitionContract("expiring_90", "expiring_30")).toBe(
        "expiring_30",
      );
    });

    it("throws on invalid transition", () => {
      expect(() => transitionContract("draft", "vacant")).toThrow(
        "Invalid transition: draft → vacant",
      );
    });
  });
});
