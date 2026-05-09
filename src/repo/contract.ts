import { createServerSupabaseClient } from "./supabase-server";
import type { Contract, ContractInsert, ContractStatus } from "@/types/contract";
import type { ContractUpdate } from "@/types/storage-file";
import type { Database } from "@/types/database";
import type { ExpiryThreshold } from "@/types/state-machine";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];
type ContractInsertRow = Database["public"]["Tables"]["contracts"]["Insert"];

function toContract(row: ContractRow): Contract {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantName: row.tenant_name,
    tenantPhone: row.tenant_phone,
    deposit: row.deposit,
    monthlyRent: row.monthly_rent,
    startDate: row.start_date,
    endDate: row.end_date,
    contractType: row.contract_type as Contract["contractType"],
    status: row.status as ContractStatus,
    originalFileUrl: row.original_file_url,
    extractedData: row.extracted_data as Record<string, unknown> | null,
    ocrConfidence: row.ocr_confidence,
    parsingConfidence: row.parsing_confidence,
    requiresReview: row.requires_review,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getContractsByLandlord(landlordId: string): Promise<Contract[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contracts")
    .select("*, properties!inner(landlord_id)")
    .eq("properties.landlord_id", landlordId)
    .order("end_date", { ascending: true });

  if (error) throw new Error(`Failed to fetch contracts: ${error.message}`);
  return (data as unknown as ContractRow[]).map(toContract);
}

export async function getContractById(id: string): Promise<Contract | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toContract(data as unknown as ContractRow);
}

export async function createContract(input: ContractInsert): Promise<Contract> {
  const supabase = await createServerSupabaseClient();
  const row: Omit<ContractInsertRow, "id"> = {
    property_id: input.propertyId,
    tenant_name: input.tenantName,
    tenant_phone: input.tenantPhone,
    deposit: input.deposit,
    monthly_rent: input.monthlyRent,
    start_date: input.startDate,
    end_date: input.endDate,
    contract_type: input.contractType,
    status: input.status,
    original_file_url: input.originalFileUrl ?? null,
    extracted_data: input.extractedData ?? null,
    ocr_confidence: input.ocrConfidence ?? null,
    parsing_confidence: input.parsingConfidence ?? null,
    requires_review: input.requiresReview ?? false,
    notes: input.notes ?? null,
  };
  const { data, error } = await supabase
    .from("contracts")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create contract: ${error.message}`);
  return toContract(data as unknown as ContractRow);
}

export async function updateContractStatus(
  id: string,
  status: ContractStatus,
): Promise<Contract> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contracts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error)
    throw new Error(`Failed to update contract status: ${error.message}`);
  return toContract(data as unknown as ContractRow);
}

export async function getExpiringContracts(
  threshold: ExpiryThreshold,
  days: number,
): Promise<Contract[]> {
  const supabase = await createServerSupabaseClient();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const targetDateStr = targetDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("status", "active")
    .lte("end_date", targetDateStr)
    .gt("end_date", new Date().toISOString().split("T")[0]);

  if (error)
    throw new Error(`Failed to fetch expiring contracts: ${error.message}`);
  return (data as unknown as ContractRow[]).map(toContract);
}

export async function updateContract(
  id: string,
  update: ContractUpdate,
): Promise<Contract> {
  const supabase = await createServerSupabaseClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (update.tenantName !== undefined) row.tenant_name = update.tenantName;
  if (update.tenantPhone !== undefined) row.tenant_phone = update.tenantPhone;
  if (update.deposit !== undefined) row.deposit = update.deposit;
  if (update.monthlyRent !== undefined) row.monthly_rent = update.monthlyRent;
  if (update.startDate !== undefined) row.start_date = update.startDate;
  if (update.endDate !== undefined) row.end_date = update.endDate;
  if (update.notes !== undefined) row.notes = update.notes;

  const { data, error } = await supabase
    .from("contracts")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update contract: ${error.message}`);
  return toContract(data as unknown as ContractRow);
}
