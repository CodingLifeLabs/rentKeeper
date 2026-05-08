import { createAuditLog, getAuditLogsByLandlord } from "@/repo/audit-log";
import type { AuditAction, AuditLog } from "@/types/audit-log";

export async function recordAudit(
  landlordId: string,
  action: AuditAction,
  targetId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await createAuditLog({ landlordId, action, targetId, metadata });
}

export async function getAuditHistory(
  landlordId: string,
  limit?: number,
): Promise<AuditLog[]> {
  return getAuditLogsByLandlord(landlordId, limit);
}

export function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    export_csv: "CSV 내보내기",
    export_xlsx: "Excel 내보내기",
    export_zip: "ZIP 내보내기",
    proposal_viewed: "제안서 열람",
    proposal_sent: "제안서 발송",
    proposal_responded: "제안서 응답",
    contract_created: "계약 등록",
    contract_updated: "계약 수정",
    login: "로그인",
    settings_changed: "설정 변경",
    // Billing
    checkout_initiated: "구독 결제 시작",
    subscription_activated: "구독 활성화",
    subscription_updated: "구독 변경",
    subscription_canceled: "구독 해지",
    subscription_expired: "구독 만료",
    subscription_past_due: "결제 지연",
    subscription_refunded: "구독 환불",
  };
  return labels[action] ?? action;
}
