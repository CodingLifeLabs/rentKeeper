export interface Database {
  public: {
    Tables: {
      landlords: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          created_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          landlord_id: string;
          address: string;
          unit_number: string | null;
          type: string;
          area_sqm: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          address: string;
          unit_number?: string | null;
          type: string;
          area_sqm?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          address?: string;
          unit_number?: string | null;
          type?: string;
          area_sqm?: number | null;
          created_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          property_id: string;
          tenant_name: string;
          tenant_phone: string;
          deposit: number;
          monthly_rent: number | null;
          start_date: string;
          end_date: string;
          contract_type: string;
          status: string;
          original_file_url: string | null;
          extracted_data: Record<string, unknown> | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_name: string;
          tenant_phone: string;
          deposit: number;
          monthly_rent?: number | null;
          start_date: string;
          end_date: string;
          contract_type: string;
          status: string;
          original_file_url?: string | null;
          extracted_data?: Record<string, unknown> | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          tenant_name?: string;
          tenant_phone?: string;
          deposit?: number;
          monthly_rent?: number | null;
          start_date?: string;
          end_date?: string;
          contract_type?: string;
          status?: string;
          original_file_url?: string | null;
          extracted_data?: Record<string, unknown> | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      renewal_proposals: {
        Row: {
          id: string;
          contract_id: string;
          proposed_rent: number | null;
          proposed_deposit: number | null;
          message: string | null;
          share_token: string;
          status: string;
          sent_at: string | null;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          contract_id: string;
          proposed_rent?: number | null;
          proposed_deposit?: number | null;
          message?: string | null;
          share_token?: string;
          status?: string;
          sent_at?: string | null;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          contract_id?: string;
          proposed_rent?: number | null;
          proposed_deposit?: number | null;
          message?: string | null;
          share_token?: string;
          status?: string;
          sent_at?: string | null;
          responded_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          contract_id: string;
          type: string;
          sent_at: string;
          channel: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          type: string;
          sent_at?: string;
          channel: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          type?: string;
          sent_at?: string;
          channel?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      contract_type: "월세" | "전세";
      contract_status: "active" | "expiring" | "expired" | "renewed" | "vacancy";
      notification_type: "d90" | "d60" | "d30" | "d7";
      notification_channel: "push" | "email";
    };
  };
}
