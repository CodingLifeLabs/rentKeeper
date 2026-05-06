import { processExpiryCheck } from "@/service/state-machine";
import * as contractRepo from "@/repo/contract";
import * as notificationRepo from "@/repo/notification";
import * as communicationRepo from "@/repo/communication";

jest.mock("@/repo/contract");
jest.mock("@/repo/notification");
jest.mock("@/repo/communication");

describe("processExpiryCheck", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("transitions expiring contracts and creates notifications", async () => {
    const mockContracts = [
      {
        id: "c1",
        propertyId: "p1",
        tenantName: "홍길동",
        tenantPhone: "010-1234-5678",
        deposit: 50000000,
        monthlyRent: 500000,
        startDate: "2025-03-01",
        endDate: "2026-03-01",
        contractType: "월세",
        status: "active",
        originalFileUrl: null,
        extractedData: null,
        ocrConfidence: null,
        parsingConfidence: null,
        requiresReview: false,
        notes: null,
        createdAt: "2025-03-01",
        updatedAt: "2025-03-01",
      },
    ];

    (contractRepo.getExpiringContracts as jest.Mock).mockImplementation(
      (threshold: string) => {
        if (threshold === "d90") return Promise.resolve(mockContracts);
        return Promise.resolve([]);
      },
    );
    (contractRepo.updateContractStatus as jest.Mock).mockResolvedValue({
      ...mockContracts[0],
      status: "expiring_90",
    });
    (notificationRepo.createNotification as jest.Mock).mockResolvedValue({
      id: "n1",
      contractId: "c1",
      type: "d90",
      sentAt: "2026-01-01",
      channel: "push",
    });
    (communicationRepo.createCommunication as jest.Mock).mockResolvedValue({
      id: "comm1",
      contractId: "c1",
      type: "notice",
      channel: "email",
      message: "계약 만료 90일 전 알림 (홍길동)",
      openedAt: null,
      respondedAt: null,
      createdAt: "2026-01-01",
    });

    const count = await processExpiryCheck();
    expect(count).toBe(1);
    expect(contractRepo.updateContractStatus).toHaveBeenCalledWith(
      "c1",
      "expiring_90",
    );
    expect(notificationRepo.createNotification).toHaveBeenCalledTimes(2);
    expect(communicationRepo.createCommunication).toHaveBeenCalledTimes(1);
  });

  it("returns 0 when no expiring contracts", async () => {
    (contractRepo.getExpiringContracts as jest.Mock).mockResolvedValue([]);

    const count = await processExpiryCheck();
    expect(count).toBe(0);
    expect(contractRepo.updateContractStatus).not.toHaveBeenCalled();
  });
});
