import {
  calculateRent,
  calculateLegalMaxRent,
} from "@/service/rent-calculator";

describe("rent-calculator", () => {
  describe("calculateLegalMaxRent", () => {
    it("calculates 5% increase from current rent", () => {
      expect(calculateLegalMaxRent(500000)).toBe(525000);
    });

    it("handles 1,000,000 rent", () => {
      expect(calculateLegalMaxRent(1000000)).toBe(1050000);
    });

    it("handles small rent amount", () => {
      expect(calculateLegalMaxRent(200000)).toBe(210000);
    });
  });

  describe("calculateRent", () => {
    it("marks legal increase within 5% as legal", () => {
      const result = calculateRent(500000, 510000, 0);
      expect(result.isLegal).toBe(true);
      expect(result.increaseRate).toBeCloseTo(0.02, 4);
      expect(result.legalMaxRate).toBe(0.05);
      expect(result.legalReference).toBeTruthy();
    });

    it("marks exactly 5% increase as legal", () => {
      const result = calculateRent(500000, 525000, 50000000);
      expect(result.isLegal).toBe(true);
      expect(result.increaseRate).toBeCloseTo(0.05, 4);
      expect(result.currentRent).toBe(500000);
      expect(result.proposedRent).toBe(525000);
      expect(result.deposit).toBe(50000000);
    });

    it("marks over 5% increase as illegal", () => {
      const result = calculateRent(500000, 550000, 0);
      expect(result.isLegal).toBe(false);
      expect(result.increaseRate).toBeCloseTo(0.1, 4);
    });

    it("marks 0% increase as legal", () => {
      const result = calculateRent(500000, 500000, 0);
      expect(result.isLegal).toBe(true);
      expect(result.increaseRate).toBe(0);
    });

    it("includes legal reference text", () => {
      const result = calculateRent(500000, 510000, 0);
      expect(result.legalReference).toContain("주택임대차보호법");
    });
  });
});
