import { NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { POLAR_WEBHOOK_SECRET } from "@/config/plans";
import { handleWebhookEvent } from "@/service/billing";

export async function POST(request: Request) {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event: Record<string, unknown>;
  try {
    event = validateEvent(body, headers, POLAR_WEBHOOK_SECRET) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  try {
    await handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
