import type { SupabaseClient } from "@supabase/supabase-js";

interface MockClient {
  from: jest.Mock;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
}

let mockClient: MockClient | null = null;

export function setMockClient(client: MockClient): void {
  mockClient = client;
}

export function setMaybeSingleResult(data: unknown, error: unknown): void {
  if (mockClient) {
    mockClient.maybeSingle.mockResolvedValue({ data, error });
  }
}

export function setSingleResult(data: unknown, error: unknown): void {
  if (mockClient) {
    mockClient.single.mockResolvedValue({ data, error });
  }
}

export function setCountResult(data: unknown): void {
  if (mockClient) {
    (mockClient as Record<string, unknown>).count = data;
  }
}

export function setDataResult(_data: unknown): void {
  // Placeholder for setting data result in mock
}

export function getMockClient(): MockClient | null {
  return mockClient;
}

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  return mockClient as unknown as SupabaseClient;
}

export async function supabaseServer(): Promise<SupabaseClient> {
  return mockClient as unknown as SupabaseClient;
}

export function resetMockClient(): void {
  mockClient = null;
}

export const TEST_MODE = true;
