import type { ContractStatus } from "@/types/contract";
import { VALID_TRANSITIONS, EXPIRY_DAYS } from "@/types/state-machine";
import type { ExpiryThreshold } from "@/types/state-machine";
import {
  updateContractStatus,
  getExpiringContracts,
} from "@/repo/contract";
import { createNotification } from "@/repo/notification";
import { createCommunication } from "@/repo/communication";
import type { NotificationChannel } from "@/types/notification";

export function canTransition(
  from: ContractStatus,
  to: ContractStatus,
): boolean {
  return VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

export function transitionContract(
  currentStatus: ContractStatus,
  targetStatus: ContractStatus,
): ContractStatus {
  if (!canTransition(currentStatus, targetStatus)) {
    throw new Error(
      `Invalid transition: ${currentStatus} → ${targetStatus}`,
    );
  }
  return targetStatus;
}

export async function processExpiryCheck(): Promise<number> {
  const thresholds: ExpiryThreshold[] = ["d90", "d30"];
  let transitioned = 0;

  for (const threshold of thresholds) {
    const days = EXPIRY_DAYS[threshold];
    const contracts = await getExpiringContracts(threshold, days);
    const targetStatus: ContractStatus =
      threshold === "d90" ? "expiring_90" : "expiring_30";

    for (const contract of contracts) {
      if (!canTransition(contract.status, targetStatus)) continue;

      await updateContractStatus(contract.id, targetStatus);

      const channels: NotificationChannel[] = ["push", "email"];
      for (const channel of channels) {
        await createNotification({
          contractId: contract.id,
          type: threshold,
          channel,
        });
      }

      await createCommunication({
        contractId: contract.id,
        type: "notice",
        channel: "email",
        message: `계약 만료 ${days}일 전 알림 (${contract.tenantName})`,
      });

      transitioned++;
    }
  }

  return transitioned;
}
