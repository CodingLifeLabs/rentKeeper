import { createClient } from "@supabase/supabase-js";

const BUCKET = "contract-files";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function uploadFile(
  landlordId: string,
  contractId: string,
  file: File,
): Promise<{ path: string; publicUrl: string | null }> {
  const supabase = getServiceClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${landlordId}/${contractId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return { path, publicUrl: null };
}

export async function getSignedUrl(
  path: string,
  expiresIn = 3600,
): Promise<string> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function listFiles(
  landlordId: string,
  contractId: string,
): Promise<{ name: string; size: number; createdAt: string }[]> {
  const supabase = getServiceClient();
  const prefix = `${landlordId}/${contractId}/`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 50, sortBy: { column: "created_at", order: "desc" } });

  if (error) throw new Error(`List failed: ${error.message}`);
  return (data ?? [])
    .filter((f) => f.id)
    .map((f) => ({
      name: f.name,
      size: f.metadata?.size ?? 0,
      createdAt: f.created_at ?? "",
    }));
}
