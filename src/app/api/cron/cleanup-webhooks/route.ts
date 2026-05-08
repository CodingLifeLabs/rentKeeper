import { NextResponse } from "next/server";
import { markDeadLetterEvents, cleanupOldWebhookEvents } from "@/repo/webhook";

export async function GET(request: Request): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deadLettered, cleaned] = await Promise.all([
    markDeadLetterEvents(),
    cleanupOldWebhookEvents(),
  ]);

  return NextResponse.json({
    ok: true,
    deadLettered,
    cleaned,
    processedAt: new Date().toISOString(),
  });
}
