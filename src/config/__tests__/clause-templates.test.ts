import { describe, it, expect } from "@jest/globals";
import { CLAUSE_CATEGORIES, CLAUSE_TEMPLATES } from "@/config/clause-templates";
import type { ClauseCategoryId } from "@/types/clause-template";

describe("CLAUSE_CATEGORIES", () => {
  it("exports 8 categories", () => {
    expect(CLAUSE_CATEGORIES).toHaveLength(8);
  });

  it("each category has id, label, and icon", () => {
    for (const cat of CLAUSE_CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });

  it("contains all expected category ids", () => {
    const ids = CLAUSE_CATEGORIES.map((c) => c.id);
    const expected: ClauseCategoryId[] = [
      "management_fee",
      "repair_responsibility",
      "registration",
      "noise_living",
      "pet",
      "parking",
      "early_termination",
      "restoration",
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });
});

describe("CLAUSE_TEMPLATES", () => {
  it("exports at least 30 templates", () => {
    expect(CLAUSE_TEMPLATES.length).toBeGreaterThanOrEqual(30);
  });

  it("each template has id, categoryId, title, and text", () => {
    for (const t of CLAUSE_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.categoryId).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.text).toBeTruthy();
    }
  });

  it("template ids are unique", () => {
    const ids = CLAUSE_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every template categoryId matches a known category", () => {
    const validIds = new Set(CLAUSE_CATEGORIES.map((c) => c.id));
    for (const t of CLAUSE_TEMPLATES) {
      expect(validIds.has(t.categoryId)).toBe(true);
    }
  });

  it("has templates for every category", () => {
    const categoriesWithTemplates = new Set(CLAUSE_TEMPLATES.map((t) => t.categoryId));
    for (const cat of CLAUSE_CATEGORIES) {
      expect(categoriesWithTemplates.has(cat.id)).toBe(true);
    }
  });

  it("templates filtered by category return correct subset", () => {
    const mgmtTemplates = CLAUSE_TEMPLATES.filter(
      (t) => t.categoryId === "management_fee",
    );
    expect(mgmtTemplates.length).toBeGreaterThan(0);
    for (const t of mgmtTemplates) {
      expect(t.categoryId).toBe("management_fee");
    }
  });
});
