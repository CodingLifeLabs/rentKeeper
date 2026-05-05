import { createServerSupabaseClient } from "./supabase-server";
import type { Landlord } from "@/types/landlord";

export async function getLandlordByUserId(userId: string): Promise<Landlord | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("landlords")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    phone: data.phone,
    createdAt: data.created_at,
  };
}

export async function createLandlord(input: {
  userId: string;
  name: string;
  phone?: string | null;
}): Promise<Landlord> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("landlords")
    .insert({
      user_id: input.userId,
      name: input.name,
      phone: input.phone ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create landlord: ${error.message}`);
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    phone: data.phone,
    createdAt: data.created_at,
  };
}
