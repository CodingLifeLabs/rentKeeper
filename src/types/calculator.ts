export interface RentCalculation {
  currentRent: number;
  proposedRent: number;
  increaseRate: number;
  legalMaxRate: number;
  isLegal: boolean;
  deposit: number;
  legalReference: string;
}
