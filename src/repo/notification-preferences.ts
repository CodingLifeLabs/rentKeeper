import { createServerSupabaseClient } from "./supabase-server";
import type { NotificationPreference } from "@/types/notification-settings";
import { DEFAULT_PREFERENCES } from "@/types/notification-settings";

export async function getPreferences(
  landlordId: string,
): Promise<NotificationPreference[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("preferences")
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data?.preferences) return DEFAULT_PREFERENCES;
  return data.preferences as NotificationPreference[];
}

export async function upsertPreferences(
  landlordId: string,
  preferences: NotificationPreference[],
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        landlord_id: landlordId,
        preferences,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "landlord_id" },
    );

  if (error) {
    throw new Error(`Failed to save notification preferences: ${error.message}`);
  }
}
