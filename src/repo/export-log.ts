import type { ExportLog, ExportLogInsert, ExportType } from "@/types/export-log";
import { createServerSupabaseClient } from "@/repo/supabase-server";

export async function createExportLog(insert: ExportLogInsert): Promise<ExportLog> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("export_logs")
    .insert({
      landlord_id: insert.landlordId,
      export_type: insert.exportType,
      row_count: insert.rowCount,
      include_phone: insert.includePhone,
    })
    .select()
    .single();

  if (error) throw error;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    landlordId: row.landlord_id as string,
    exportType: row.export_type as ExportType,
    exportedAt: row.exported_at as string,
    rowCount: row.row_count as number,
    includePhone: row.include_phone as boolean,
  };
}

export async function getExportLogsByLandlord(landlordId: string): Promise<ExportLog[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("export_logs")
    .select()
    .eq("landlord_id", landlordId)
    .order("exported_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    landlordId: row.landlord_id as string,
    exportType: row.export_type as ExportType,
    exportedAt: row.exported_at as string,
    rowCount: row.row_count as number,
    includePhone: row.include_phone as boolean,
  }));
}
