export type ClauseCategoryId =
  | "management_fee"
  | "repair_responsibility"
  | "registration"
  | "noise_living"
  | "pet"
  | "parking"
  | "early_termination"
  | "restoration";

export interface ClauseCategory {
  id: ClauseCategoryId;
  label: string;
  icon: string;
}

export interface ClauseTemplate {
  id: string;
  categoryId: ClauseCategoryId;
  title: string;
  text: string;
}
