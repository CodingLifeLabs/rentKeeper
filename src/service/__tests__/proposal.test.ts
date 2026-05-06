import {
  sendRenewalProposal,
  handleTenantResponse,
  generateShareToken,
} from "@/service/proposal";

jest.mock("@/repo/renewal-proposal", () => ({
  createProposal: jest.fn(),
  getProposalByToken: jest.fn(),
  updateProposalStatus: jest.fn(),
}));

jest.mock("@/repo/contract", () => ({
  getContractById: jest.fn(),
  updateContractStatus: jest.fn(),
}));

jest.mock("@/repo/communication", () => ({
  createCommunication: jest.fn(),
}));

jest.mock("@/service/state-machine", () => ({
  transitionContract: jest.fn(),
}));

import { createProposal, getProposalByToken, updateProposalStatus } from "@/repo/renewal-proposal";
import { getContractById, updateContractStatus } from "@/repo/contract";
import { createCommunication } from "@/repo/communication";
import { transitionContract } from "@/service/state-machine";

const mockContract = {
  id: "contract-1",
  propertyId: "prop-1",
  tenantName: "홍길동",
  tenantPhone: "010-1234-5678",
  deposit: 10000000,
  monthlyRent: 500000,
  startDate: "2024-01-01",
  endDate: "2025-12-31",
  contractType: "월세" as const,
  status: "expiring_90" as const,
  originalFileUrl: null,
  extractedData: null,
  ocrConfidence: null,
  parsingConfidence: null,
  requiresReview: false,
  notes: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockProposal = {
  id: "proposal-1",
  contractId: "contract-1",
  proposedRent: 550000,
  proposedDeposit: 10000000,
  message: "갱신 제안",
  shareToken: "abc123xyz456",
  status: "sent" as const,
  sentAt: "2025-01-01",
  respondedAt: null,
  createdAt: "2025-01-01",
};

describe("generateShareToken", () => {
  it("generates a 12-char token", async () => {
    const token = await generateShareToken();
    expect(token).toHaveLength(12);
  });

  it("generates unique tokens", async () => {
    const t1 = await generateShareToken();
    const t2 = await generateShareToken();
    expect(t1).not.toBe(t2);
  });
});

describe("sendRenewalProposal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates proposal and transitions contract to negotiating", async () => {
    (getContractById as jest.Mock).mockResolvedValue(mockContract);
    (createProposal as jest.Mock).mockResolvedValue(mockProposal);
    (transitionContract as jest.Mock).mockReturnValue("negotiating");
    (updateContractStatus as jest.Mock).mockResolvedValue({ ...mockContract, status: "negotiating" });
    (createCommunication as jest.Mock).mockResolvedValue({ id: "comm-1" });

    const result = await sendRenewalProposal({
      contractId: "contract-1",
      proposedRent: 550000,
      proposedDeposit: 10000000,
      message: "갱신 제안",
    });

    expect(result).toEqual(mockProposal);
    expect(transitionContract).toHaveBeenCalledWith("expiring_90", "negotiating");
    expect(updateContractStatus).toHaveBeenCalledWith("contract-1", "negotiating");
    expect(createCommunication).toHaveBeenCalledWith(
      expect.objectContaining({
        contractId: "contract-1",
        type: "renewal",
        channel: "email",
      }),
    );
  });

  it("throws when contract not found", async () => {
    (getContractById as jest.Mock).mockResolvedValue(null);

    await expect(
      sendRenewalProposal({
        contractId: "missing",
        proposedRent: 500000,
        proposedDeposit: 10000000,
      }),
    ).rejects.toThrow("Contract not found");
  });
});

describe("handleTenantResponse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts proposal and transitions to renewed", async () => {
    (getProposalByToken as jest.Mock).mockResolvedValue(mockProposal);
    (updateProposalStatus as jest.Mock).mockResolvedValue({
      ...mockProposal,
      status: "accepted",
    });
    (getContractById as jest.Mock).mockResolvedValue({ ...mockContract, status: "negotiating" });
    (transitionContract as jest.Mock).mockReturnValue("renewed");
    (updateContractStatus as jest.Mock).mockResolvedValue({ ...mockContract, status: "renewed" });
    (createCommunication as jest.Mock).mockResolvedValue({ id: "comm-2" });

    const result = await handleTenantResponse({
      proposalId: "proposal-1",
      shareToken: "abc123xyz456",
      action: "accept",
      tenantMessage: "수락합니다",
    });

    expect(result.status).toBe("accepted");
    expect(transitionContract).toHaveBeenCalledWith("negotiating", "renewed");
    expect(updateContractStatus).toHaveBeenCalledWith("contract-1", "renewed");
    expect(createCommunication).toHaveBeenCalledWith(
      expect.objectContaining({ type: "renewal" }),
    );
  });

  it("rejects proposal and transitions to move_out_pending", async () => {
    (getProposalByToken as jest.Mock).mockResolvedValue(mockProposal);
    (updateProposalStatus as jest.Mock).mockResolvedValue({
      ...mockProposal,
      status: "rejected",
    });
    (getContractById as jest.Mock).mockResolvedValue({ ...mockContract, status: "negotiating" });
    (transitionContract as jest.Mock).mockReturnValue("move_out_pending");
    (updateContractStatus as jest.Mock).mockResolvedValue({ ...mockContract, status: "move_out_pending" });
    (createCommunication as jest.Mock).mockResolvedValue({ id: "comm-3" });

    const result = await handleTenantResponse({
      proposalId: "proposal-1",
      shareToken: "abc123xyz456",
      action: "reject",
    });

    expect(result.status).toBe("rejected");
    expect(transitionContract).toHaveBeenCalledWith("negotiating", "move_out_pending");
    expect(updateContractStatus).toHaveBeenCalledWith("contract-1", "move_out_pending");
  });

  it("negotiate keeps status as negotiating", async () => {
    (getProposalByToken as jest.Mock).mockResolvedValue(mockProposal);
    (updateProposalStatus as jest.Mock).mockResolvedValue({
      ...mockProposal,
      status: "negotiating",
    });
    (getContractById as jest.Mock).mockResolvedValue({ ...mockContract, status: "negotiating" });
    (createCommunication as jest.Mock).mockResolvedValue({ id: "comm-4" });

    const result = await handleTenantResponse({
      proposalId: "proposal-1",
      shareToken: "abc123xyz456",
      action: "negotiate",
      tenantMessage: "협의 요청",
    });

    expect(result.status).toBe("negotiating");
    expect(transitionContract).not.toHaveBeenCalled();
  });

  it("throws when proposal not found", async () => {
    (getProposalByToken as jest.Mock).mockResolvedValue(null);

    await expect(
      handleTenantResponse({
        proposalId: "missing",
        shareToken: "bad-token",
        action: "accept",
      }),
    ).rejects.toThrow("Proposal not found");
  });

  it("throws when already responded", async () => {
    (getProposalByToken as jest.Mock).mockResolvedValue({
      ...mockProposal,
      status: "accepted",
    });

    await expect(
      handleTenantResponse({
        proposalId: "proposal-1",
        shareToken: "abc123xyz456",
        action: "accept",
      }),
    ).rejects.toThrow("Proposal already responded");
  });

  it("throws when token mismatch", async () => {
    (getProposalByToken as jest.Mock).mockResolvedValue(mockProposal);

    await expect(
      handleTenantResponse({
        proposalId: "different-id",
        shareToken: "abc123xyz456",
        action: "accept",
      }),
    ).rejects.toThrow("Token mismatch");
  });
});
