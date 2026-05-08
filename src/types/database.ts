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
        Relationships: [];
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
        Relationships: [];
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
          ocr_confidence: number | null;
          parsing_confidence: number | null;
          requires_review: boolean;
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
          ocr_confidence?: number | null;
          parsing_confidence?: number | null;
          requires_review?: boolean;
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
          ocr_confidence?: number | null;
          parsing_confidence?: number | null;
          requires_review?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      communications: {
        Row: {
          id: string;
          contract_id: string;
          type: string;
          channel: string;
          message: string;
          opened_at: string | null;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          type: string;
          channel: string;
          message: string;
          opened_at?: string | null;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          type?: string;
          channel?: string;
          message?: string;
          opened_at?: string | null;
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          landlord_id: string;
          preferences: Record<string, unknown>[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          preferences?: Record<string, unknown>[];
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          preferences?: Record<string, unknown>[];
          updated_at?: string;
        };
        Relationships: [];
      };
      export_logs: {
        Row: {
          id: string;
          landlord_id: string;
          export_type: string;
          exported_at: string;
          row_count: number;
          include_phone: boolean;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          export_type: string;
          exported_at?: string;
          row_count: number;
          include_phone?: boolean;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          export_type?: string;
          exported_at?: string;
          row_count?: number;
          include_phone?: boolean;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          landlord_id: string;
          action: string;
          target_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          action: string;
          target_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          action?: string;
          target_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          landlord_id: string;
          plan_tier: string;
          polar_subscription_id: string | null;
          polar_customer_id: string | null;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          grace_end_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          plan_tier: string;
          polar_subscription_id?: string | null;
          polar_customer_id?: string | null;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          grace_end_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          plan_tier?: string;
          polar_subscription_id?: string | null;
          polar_customer_id?: string | null;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          grace_end_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          processed_at: string;
          last_error: string | null;
          attempt_count: number;
          is_dead_letter: boolean;
          payload: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          processed_at?: string;
          last_error?: string | null;
          attempt_count?: number;
          is_dead_letter?: boolean;
          payload?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          event_type?: string;
          processed_at?: string;
          last_error?: string | null;
          attempt_count?: number;
          is_dead_letter?: boolean;
          payload?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_webhook_attempt: {
        Args: { p_event_id: string };
        Returns: void;
      };
    };
    Enums: {
      contract_type: "월세" | "전세";
      contract_status: "draft" | "active" | "expiring_90" | "expiring_30" | "negotiating" | "renewed" | "move_out_pending" | "vacant" | "archived";
      notification_type: "d90" | "d60" | "d30" | "d7";
      notification_channel: "push" | "email" | "kakao";
      communication_type: "renewal" | "notice";
      communication_channel: "email" | "kakao";
    };
  };
}
