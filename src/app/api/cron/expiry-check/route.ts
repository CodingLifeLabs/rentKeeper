import { NextResponse } from "next/server";
import { processExpiryCheck } from "@/service/state-machine";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transitioned = await processExpiryCheck();

  return NextResponse.json({
    ok: true,
    transitioned,
    checkedAt: new Date().toISOString(),
  });
}
