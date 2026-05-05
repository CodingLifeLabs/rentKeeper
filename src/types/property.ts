export type PropertyType = "원룸" | "오피스텔" | "다가구";

export interface Property {
  id: string;
  landlordId: string;
  address: string;
  unitNumber: string | null;
  type: PropertyType;
  areaSqm: number | null;
  createdAt: string;
}

export interface PropertyInsert {
  landlordId: string;
  address: string;
  unitNumber?: string | null;
  type: PropertyType;
  areaSqm?: number | null;
}
