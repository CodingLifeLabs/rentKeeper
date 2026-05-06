import { createServerSupabaseClient } from "./supabase-server";
import type { Notification, NotificationInsert } from "@/types/notification";
import type { Database } from "@/types/database";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    contractId: row.contract_id,
    type: row.type as Notification["type"],
    sentAt: row.sent_at,
    channel: row.channel as Notification["channel"],
  };
}

export async function getNotificationsByContract(
  contractId: string,
): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("contract_id", contractId)
    .order("sent_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
  return (data as unknown as NotificationRow[]).map(toNotification);
}

export async function createNotification(
  input: NotificationInsert,
): Promise<Notification> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      contract_id: input.contractId,
      type: input.type,
      channel: input.channel,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create notification: ${error.message}`);
  return toNotification(data as unknown as NotificationRow);
}
