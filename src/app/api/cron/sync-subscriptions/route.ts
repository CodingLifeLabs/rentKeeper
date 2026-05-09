import { NextResponse } from "next/server";
import { syncSubscriptionsWithPolar } from "@/service/billing";

export async function GET(request: Request): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { checked, updated } = await syncSubscriptionsWithPolar();

  return NextResponse.json({
    ok: true,
    checked,
    updated,
    syncedAt: new Date().toISOString(),
  });
}
