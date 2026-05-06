import { createServerSupabaseClient } from "./supabase-server";
import type { Communication, CommunicationInsert } from "@/types/communication";
import type { Database } from "@/types/database";

type CommunicationRow = Database["public"]["Tables"]["communications"]["Row"];

function toCommunication(row: CommunicationRow): Communication {
  return {
    id: row.id,
    contractId: row.contract_id,
    type: row.type as Communication["type"],
    channel: row.channel as Communication["channel"],
    message: row.message,
    openedAt: row.opened_at,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
  };
}

export async function getCommunicationsByContract(
  contractId: string,
): Promise<Communication[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("communications")
    .select("*")
    .eq("contract_id", contractId)
    .order("created_at", { ascending: false });

  if (error)
    throw new Error(`Failed to fetch communications: ${error.message}`);
  return (data as unknown as CommunicationRow[]).map(toCommunication);
}

export async function createCommunication(
  input: CommunicationInsert,
): Promise<Communication> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("communications")
    .insert({
      contract_id: input.contractId,
      type: input.type,
      channel: input.channel,
      message: input.message,
    })
    .select()
    .single();

  if (error)
    throw new Error(`Failed to create communication: ${error.message}`);
  return toCommunication(data as unknown as CommunicationRow);
}

export async function markCommunicationOpened(
  id: string,
): Promise<Communication | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("communications")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return toCommunication(data as unknown as CommunicationRow);
}
