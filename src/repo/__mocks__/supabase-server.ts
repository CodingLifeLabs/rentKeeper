import type { SupabaseClient } from "@supabase/supabase-js";

let mockClient: SupabaseClient | null = null;

interface MockChain {
  from: jest.Mock;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  neq: jest.Mock;
  gt: jest.Mock;
  gte: jest.Mock;
  lt: jest.Mock;
  lte: jest.Mock;
  in: jest.Mock;
  not: jest.Mock;
  is: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  range: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
  then: jest.Mock;
}

function createMockClient(): SupabaseClient {
  const dataResult: unknown = null;
  const errorResult: unknown = null;
  const defaultResolved = { data: dataResult, error: errorResult };

  const instance: MockChain = {
    from: jest.fn((_table: string) => instance),
    select: jest.fn((_query?: string) => instance),
    insert: jest.fn(() => instance),
    update: jest.fn(() => instance),
    upsert: jest.fn(() => instance),
    delete: jest.fn(() => instance),
    eq: jest.fn((_column: string, _value: unknown) => instance),
    neq: jest.fn((_column: string, _value: unknown) => instance),
    gt: jest.fn((_column: string, _value: unknown) => instance),
    gte: jest.fn((_column: string, _value: unknown) => instance),
    lt: jest.fn((_column: string, _value: unknown) => instance),
    lte: jest.fn((_column: string, _value: unknown) => instance),
    in: jest.fn((_column: string, _values: unknown[]) => instance),
    not: jest.fn((_column: string, _operator: string, _value: unknown) => instance),
    is: jest.fn((_column: string, _value: unknown) => instance),
    order: jest.fn((_column: string) => instance),
    limit: jest.fn((_count: number) => instance),
    range: jest.fn((_from: number, _to: number) => instance),
    maybeSingle: jest.fn(() => defaultResolved),
    single: jest.fn(() => defaultResolved),
    then: jest.fn((resolve: (v: unknown) => void) => resolve(defaultResolved)),
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
