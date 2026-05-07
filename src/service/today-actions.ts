import { getContractsByLandlord } from "@/repo/contract";
import { getProposalsByContract } from "@/repo/renewal-proposal";
import type { TodayAction } from "@/types/audit-log";
import type { Contract } from "@/types/contract";

const EXPIRING_DAYS_THRESHOLD = 60;
const NO_RESPONSE_DAYS_THRESHOLD = 7;

export async function getTodayActions(
  landlordId: string,
  now: Date = new Date(),
): Promise<TodayAction[]> {
  const contracts = await getContractsByLandlord(landlordId);
  const actions: TodayAction[] = [];

  for (const contract of contracts) {
    if (contract.status === "active" || contract.status === "expiring_90" || contract.status === "expiring_30") {
      const daysUntil = daysBetween(now, new Date(contract.endDate));

      if (daysUntil <= EXPIRING_DAYS_THRESHOLD && daysUntil > 0) {
        actions.push({
          id: `expire-${contract.id}`,
          type: "expiring_soon",
          label: "만기 임박",
          description: `${contract.tenantName} 계약이 ${daysUntil}일 후 만료됩니다`,
          contractId: contract.id,
          tenantName: contract.tenantName,
          daysUntil,
          urgency: daysUntil <= 30 ? "high" : daysUntil <= 45 ? "medium" : "low",
        });
      }
    }
  }

  for (const contract of contracts) {
    if (contract.status !== "active" && contract.status !== "expiring_90" && contract.status !== "expiring_30") continue;

    const proposals = await getProposalsByContract(contract.id);
    const sentProposal = proposals.find((p) => p.status === "sent");

    if (sentProposal) {
      const daysSinceSent = daysBetween(new Date(sentProposal.sentAt), now);
      if (daysSinceSent >= NO_RESPONSE_DAYS_THRESHOLD) {
        actions.push({
          id: `no-response-${sentProposal.id}`,
          type: "no_response",
          label: "응답 없음",
          description: `${contract.tenantName}에게 ${daysSinceSent}일째 응답이 없습니다`,
          contractId: contract.id,
          tenantName: contract.tenantName,
          daysSinceSent,
          urgency: daysSinceSent >= 14 ? "high" : "medium",
        });
      }
    } else {
      const daysUntil = daysBetween(now, new Date(contract.endDate));
      if (daysUntil <= EXPIRING_DAYS_THRESHOLD && daysUntil > 30) {
        actions.push({
          id: `renewal-${contract.id}`,
          type: "renewal_contact",
          label: "갱신 연락 필요",
          description: `${contract.tenantName}에게 갱신 제안을 보내세요`,
          contractId: contract.id,
          tenantName: contract.tenantName,
          daysUntil,
          urgency: "low",
        });
      }
    }
  }

  return actions.sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency));
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 86400000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

function urgencyRank(u: "high" | "medium" | "low"): number {
  return u === "high" ? 0 : u === "medium" ? 1 : 2;
}

export function getMockTodayActions(): TodayAction[] {
  return [
    {
      id: "expire-1",
      type: "expiring_soon",
      label: "만기 임박",
      description: "홍길동 계약이 25일 후 만료됩니다",
      contractId: "contract-1",
      tenantName: "홍길동",
      daysUntil: 25,
      urgency: "high",
    },
    {
      id: "no-response-1",
      type: "no_response",
      label: "응답 없음",
      description: "김철수에게 8일째 응답이 없습니다",
      contractId: "contract-2",
      tenantName: "김철수",
      daysSinceSent: 8,
      urgency: "medium",
    },
    {
      id: "renewal-1",
      type: "renewal_contact",
      label: "갱신 연락 필요",
      description: "이영희에게 갱신 제안을 보내세요",
      contractId: "contract-3",
      tenantName: "이영희",
      daysUntil: 55,
      urgency: "low",
    },
  ];
}
