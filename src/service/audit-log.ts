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
  };
  return labels[action] ?? action;
}
