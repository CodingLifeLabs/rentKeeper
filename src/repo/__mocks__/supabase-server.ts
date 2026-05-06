import type { SupabaseClient } from "@supabase/supabase-js";

let mockClient: SupabaseClient | null = null;

interface MockChain {
  from: jest.Mock;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
}

function createMockClient(): SupabaseClient {
  const dataResult: unknown = null;
  const errorResult: unknown = null;

  const instance: MockChain = {
    from: jest.fn((_table: string) => instance),
    select: jest.fn((_query?: string) => instance),
    insert: jest.fn(() => instance),
    update: jest.fn(() => instance),
    delete: jest.fn(() => instance),
    eq: jest.fn((_column: string, _value: unknown) => instance),
    maybeSingle: jest.fn(() => ({ data: dataResult, error: errorResult })),
    single: jest.fn(() => ({ data: dataResult, error: errorResult })),
  };

  return instance as unknown as SupabaseClient;
}

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  if (!mockClient) {
    mockClient = createMockClient();
  }
  return mockClient;
}

export function resetMockClient(): void {
  mockClient = null;
}

export async function supabaseServer(): Promise<SupabaseClient> {
  return createServerSupabaseClient();
}
