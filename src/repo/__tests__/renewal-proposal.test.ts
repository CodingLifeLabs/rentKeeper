/* eslint-disable @typescript-eslint/no-require-imports */
import {
  getProposalsByContract,
  getProposalByToken,
  createProposal,
  updateProposalStatus,
} from "@/repo/renewal-proposal";

jest.mock("@/repo/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

function createMockClient() {
  const chain = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
  };
  mockSelect.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
  mockUpdate.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  mockSingle.mockReturnValue(chain);
  return chain;
}

const { createServerSupabaseClient } = require("@/repo/supabase-server");

beforeEach(() => {
  jest.clearAllMocks();
  const client = {
    from: jest.fn().mockReturnValue(createMockClient()),
  };
  (createServerSupabaseClient as jest.Mock).mockResolvedValue(client);
});

const sampleRow = {
  id: "p-1",
  contract_id: "c-1",
  proposed_rent: 550000,
  proposed_deposit: 10000000,
  message: "renew",
  share_token: "abc123",
  status: "sent",
  sent_at: "2025-01-01T00:00:00Z",
  responded_at: null,
};

describe("getProposalsByContract", () => {
  it("returns mapped proposals", async () => {
    const client = await createServerSupabaseClient();
    mockOrder.mockResolvedValue({ data: [sampleRow], error: null });

    const result = await getProposalsByContract("c-1");

    expect(client.from).toHaveBeenCalledWith("renewal_proposals");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "p-1",
      contractId: "c-1",
      proposedRent: 550000,
      proposedDeposit: 10000000,
      message: "renew",
      shareToken: "abc123",
      status: "sent",
      sentAt: "2025-01-01T00:00:00Z",
      respondedAt: null,
      createdAt: "p-1",
    });
  });

  it("throws on db error", async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: "fail" } });

    await expect(getProposalsByContract("c-1")).rejects.toThrow("Failed to fetch proposals");
  });
});

describe("getProposalByToken", () => {
  it("returns proposal when found", async () => {
    mockSingle.mockResolvedValue({ data: sampleRow, error: null });

    const result = await getProposalByToken("abc123");

    expect(result).not.toBeNull();
    expect(result?.shareToken).toBe("abc123");
  });

  it("returns null when not found", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

    const result = await getProposalByToken("bad-token");
    expect(result).toBeNull();
  });
});

describe("createProposal", () => {
  it("inserts and returns proposal", async () => {
    mockSingle.mockResolvedValue({ data: sampleRow, error: null });

    const result = await createProposal(
      {
        contractId: "c-1",
        proposedRent: 550000,
        proposedDeposit: 10000000,
        message: "renew",
      },
      "abc123",
    );

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contract_id: "c-1",
        proposed_rent: 550000,
        share_token: "abc123",
        status: "sent",
      }),
    );
    expect(result.id).toBe("p-1");
  });

  it("throws on insert error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "insert fail" } });

    await expect(
      createProposal(
        { contractId: "c-1", proposedRent: 500000, proposedDeposit: 10000000 },
        "tok",
      ),
    ).rejects.toThrow("Failed to create proposal");
  });
});

describe("updateProposalStatus", () => {
  it("updates status and returns proposal", async () => {
    const acceptedRow = { ...sampleRow, status: "accepted", responded_at: "2025-06-01T00:00:00Z" };
    mockSingle.mockResolvedValue({ data: acceptedRow, error: null });

    const result = await updateProposalStatus("p-1", "accepted");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "accepted" }),
    );
    expect(result.status).toBe("accepted");
  });

  it("throws on update error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "update fail" } });

    await expect(updateProposalStatus("p-1", "accepted")).rejects.toThrow(
      "Failed to update proposal",
    );
  });
});
