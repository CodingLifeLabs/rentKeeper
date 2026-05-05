export interface Landlord {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  createdAt: string;
}

export interface LandlordInsert {
  userId: string;
  name: string;
  phone?: string | null;
}
