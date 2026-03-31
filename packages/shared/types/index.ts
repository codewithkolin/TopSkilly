// ============================================================
// TOPSKILLY — Shared TypeScript Types
// Used by both apps/web and apps/mobile
// ============================================================

export type UserRole = "student" | "professional" | "admin";

export type UrgencyLevel = "low" | "medium" | "high" | "urgent";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type PurchaseType = "coin_topup" | "subscription";

export type PaymentGateway = "razorpay" | "stripe" | "apple_iap" | "google_play";

// ============================================================
// Supabase Database types (generated shape)
// ============================================================
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: UserRole;
          verified: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };

      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          slug: string;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };

      tutor_profiles: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          subjects: string[];
          credentials: string | null;
          credential_url: string | null;
          verified_badge: boolean;
          badge_approved_at: string | null;
          rating: number;
          review_count: number;
          bio: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tutor_profiles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["tutor_profiles"]["Insert"]>;
      };

      leads: {
        Row: {
          id: string;
          student_id: string;
          category_id: string | null;
          subject: string;
          description: string;
          level: SkillLevel;
          urgency: UrgencyLevel;
          budget_inr: number | null;
          max_buyers: number;
          buyer_count: number;
          active: boolean;
          otp_verified: boolean;
          otp_phone: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "buyer_count" | "active" | "otp_verified" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };

      lead_unlocks: {
        Row: {
          id: string;
          lead_id: string;
          tutor_id: string;
          coins_spent: number;
          unlocked_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lead_unlocks"]["Row"], "id" | "unlocked_at">;
        Update: never;
      };

      wallets: {
        Row: {
          user_id: string;
          coins_balance: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wallets"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["wallets"]["Insert"]>;
      };

      purchases: {
        Row: {
          id: string;
          user_id: string;
          type: PurchaseType;
          amount_inr: number;
          coins_credited: number;
          gateway: PaymentGateway;
          gateway_order_id: string | null;
          gateway_payment_id: string | null;
          status: "pending" | "success" | "failed";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["purchases"]["Row"], "id" | "created_at">;
        Update: Pick<Database["public"]["Tables"]["purchases"]["Row"], "status" | "gateway_payment_id">;
      };

      messages: {
        Row: {
          id: string;
          lead_id: string | null;
          from_id: string;
          to_id: string;
          content: string;
          sent_at: string;
          read_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "sent_at">;
        Update: Pick<Database["public"]["Tables"]["messages"]["Row"], "read_at">;
      };

      reviews: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          lead_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };

    Functions: {
      unlock_lead: {
        Args: { p_lead_id: string; p_tutor_id: string; p_coins?: number };
        Returns: {
          success: boolean;
          error?: string;
          contact?: { name: string; phone: string; email: string };
          coins_remaining?: number;
        };
      };
      add_coins: {
        Args: { p_user_id: string; p_amount: number };
        Returns: void;
      };
    };
  };
};
