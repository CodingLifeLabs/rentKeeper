import { NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { POLAR_WEBHOOK_SECRET } from "@/config/plans";
import { handleWebhookEvent } from "@/service/billing";
import {
  hasProcessedWebhookEvent,
  markWebhookEventProcessed,
  markWebhookEventFailed,
} from "@/repo/webhook";

const TIMESTAMP_TOLERANCE_SECONDS = 300; // ±5 minutes

function isTimestampFresh(webhookTimestamp: string | undefined): boolean {
  if (!webhookTimestamp) return true; // no timestamp header — skip check
  const ts = parseInt(webhookTimestamp, 10);
  if (isNaN(ts)) return false;
  const diffSeconds = Math.abs(Date.now() / 1000 - ts);
  return diffSeconds <= TIMESTAMP_TOLERANCE_SECONDS;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  if (!isTimestampFresh(headers["webhook-timestamp"])) {
    return NextResponse.json({ error: "Webhook timestamp out of range" }, { status: 400 });
  }

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(body, headers, POLAR_WEBHOOK_SECRET);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const eventId = headers["webhook-id"];
  if (eventId) {
    const alreadyProcessed = await hasProcessedWebhookEvent(eventId);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true });
    }
  }

  let payload: Record<string, unknown> | undefined;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    // non-JSON body — payload stays undefined
  }

  try {
    await handleWebhookEvent(event);
    if (eventId) {
      await markWebhookEventProcessed(eventId, event.type, payload);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    if (eventId) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      await markWebhookEventFailed(eventId, event.type, errorMessage, payload);
    }
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
