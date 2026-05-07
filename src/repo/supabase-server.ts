import { createServerClient } from "@supabase/ssr";

export const TEST_MODE = process.env.NEXT_PUBLIC_SUPABASE_TEST_MODE === "true";

export async function supabaseServer() {
  return createServerSupabaseClient();
}

export async function createServerSupabaseClient() {
  if (TEST_MODE) {
    return (await import("./__mocks__/supabase-server")).createServerSupabaseClient();
  }

  const { cookies } = await import("next/headers");

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Cookie writes are handled by the proxy (proxy.ts).
          // Server Components cannot modify cookies in Next.js 16.
        },
      },
    },
  );
}
