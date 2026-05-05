import { createServerSupabaseClient } from "./supabase-server";
import type { Contract, ContractInsert, ContractStatus } from "@/types/contract";
import type { Database } from "@/types/database";

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
