import { createServerSupabaseClient } from "./supabase-server";
import type { AuditLog, AuditLogInsert, AuditAction } from "@/types/audit-log";

export async function createAuditLog(insert: AuditLogInsert): Promise<AuditLog> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      landlord_id: insert.landlordId,
      action: insert.action,
      target_id: insert.targetId ?? null,
      metadata: insert.metadata ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  const row = data as Record<string, unknown>;
  return toAuditLog(row);
}

export async function getAuditLogsByLandlord(
  landlordId: string,
  limit = 50,
): Promise<AuditLog[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select()
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as Record<string, unknown>[]).map(toAuditLog);
}

export async function getAuditLogsByTarget(
  landlordId: string,
  targetId: string,
): Promise<AuditLog[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select()
    .eq("landlord_id", landlordId)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as Record<string, unknown>[]).map(toAuditLog);
}

function toAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    landlordId: row.landlord_id as string,
    action: row.action as AuditAction,
    targetId: row.target_id as string | null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.created_at as string,
  };
}
