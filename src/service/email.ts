import { getResendClient } from "@/config/resend";
import type { NotificationType } from "@/types/notification";

const EXPIRY_LABELS: Record<string, string> = {
  d90: "90일",
  d60: "60일",
  d30: "30일",
  d7: "7일",
};

function getDaysFromType(type: NotificationType): string {
  return EXPIRY_LABELS[type] ?? type;
}

interface ExpiryEmailPayload {
  to: string;
  tenantName: string;
  address: string;
  endDate: string;
  type: NotificationType;
  landlordName: string;
}

export async function sendExpiryEmail(payload: ExpiryEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
}> {
  const days = getDaysFromType(payload.type);

  if (!process.env.RESEND_API_KEY) {
    return { success: true, messageId: "mock-no-api-key" };
  }

  const { data, error } = await getResendClient().emails.send({
    from: "RentKeeper <noreply@rentkeeper.app>",
    to: payload.to,
    subject: `[렌트키퍼] ${payload.tenantName} 계약 만료 ${days} 전 알림`,
    html: buildExpiryHtml(payload, days),
  });

  if (error) {
    console.error("Resend email error:", error);
    return { success: false };
  }

  return { success: true, messageId: data?.id };
}

function buildExpiryHtml(
  payload: ExpiryEmailPayload,
  days: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px; color: #1e293b;">
  <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
    <div style="background: #1A3C5E; padding: 24px 32px;">
      <h1 style="margin: 0; color: #fff; font-size: 20px;">RentKeeper 렌트키퍼</h1>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; margin-bottom: 24px;">${payload.landlordName}님,</p>
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        <strong>${payload.tenantName}</strong> 임차인의 계약이 <strong style="color: #FF8C00;">${days} 후</strong> 만료됩니다.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="background: #F7F9FC;">
          <td style="padding: 12px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">임대물</td>
          <td style="padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${payload.address}</td>
        </tr>
        <tr style="background: #F7F9FC;">
          <td style="padding: 12px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">임차인</td>
          <td style="padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${payload.tenantName}</td>
        </tr>
        <tr style="background: #F7F9FC;">
          <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">만기일</td>
          <td style="padding: 12px 16px; font-size: 14px;">${payload.endDate}</td>
        </tr>
      </table>
      <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
        갱신 제안서 발송이나 계약 상태 변경은 렌트키퍼 대시보드에서 확인하세요.
      </p>
    </div>
    <div style="background: #F7F9FC; padding: 16px 32px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_URL ?? "https://rentkeeper.vercel.app"}/dashboard"
         style="display: inline-block; background: #00C896; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
        대시보드 바로가기
      </a>
    </div>
  </div>
</body>
</html>`;
}
