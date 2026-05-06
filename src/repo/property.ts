import { createServerSupabaseClient } from "./supabase-server";
import type { Property, PropertyInsert, PropertyType } from "@/types/property";
import type { Database } from "@/types/database";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyInsertRow = Database["public"]["Tables"]["properties"]["Insert"];

function toProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    landlordId: row.landlord_id,
    address: row.address,
    unitNumber: row.unit_number,
    type: row.type as PropertyType,
    areaSqm: row.area_sqm,
    createdAt: row.created_at,
  };
}

export async function getPropertiesByLandlord(
  landlordId: string,
): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch properties: ${error.message}`);
  return (data as unknown as PropertyRow[]).map(toProperty);
}

export async function getPropertyById(
  id: string,
): Promise<Property | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toProperty(data as unknown as PropertyRow);
}

export async function createProperty(
  input: PropertyInsert,
): Promise<Property> {
  const supabase = await createServerSupabaseClient();
  const row: Omit<PropertyInsertRow, "id"> = {
    landlord_id: input.landlordId,
    address: input.address,
    unit_number: input.unitNumber ?? null,
    type: input.type,
    area_sqm: input.areaSqm ?? null,
  };
  const { data, error } = await supabase
    .from("properties")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create property: ${error.message}`);
  return toProperty(data as unknown as PropertyRow);
}
