import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/service/auth";
import {
  getCurrentSubscription,
  canPerformAction,
  getCheckoutUrl,
  getCustomerPortalUrl,
} from "@/service/billing";
import { getLandlordByUserId } from "@/repo/landlord";

// In-memory rate limiter — single instance per process.
// For multi-instance production, replace with Upstash Redis.
const rateLimitWindows = new Map<string, number[]>();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitWindows.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  rateLimitWindows.set(key, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

const checkoutSchema = z.object({
  tier: z.enum(["pro", "business"]),
});

const actionSchema = z.object({
  action: z.enum([
    "create_contract",
    "use_ocr",
    "send_proposal",
    "use_communication",
    "use_branding",
  ]),
});

const portalSchema = z.object({
  action: z.literal("portal"),
});

const billingRequestSchema = z.union([checkoutSchema, actionSchema, portalSchema]);

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const landlord = await getLandlordByUserId(user.id);
  if (!landlord) {
    return NextResponse.json({ plan: "free", subscription: null });
  }

  const subscription = await getCurrentSubscription(landlord.id);
  const plan =
    subscription?.status === "active" ? subscription.planTier : "free";

  return NextResponse.json({ plan, subscription });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = `billing:${user.id}:${ip}`;
  const { allowed, retryAfterSeconds } = checkRateLimit(rateLimitKey);
  if (!allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "유효하지 않은 요청 형식입니다." },
      { status: 400 },
    );
  }

  const parsed = billingRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "tier 또는 action이 필요합니다." },
      { status: 400 },
    );
  }

  const body = parsed.data;

  if ("action" in body && body.action === "portal") {
    const landlord = await getLandlordByUserId(user.id);
    if (!landlord) {
      return NextResponse.json({ error: "임대인 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    try {
      const url = await getCustomerPortalUrl(landlord.id);
      return NextResponse.json({ url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "포털 URL 생성에 실패했습니다.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if ("action" in body) {
    const landlord = await getLandlordByUserId(user.id);
    const result = await canPerformAction(
      landlord?.id ?? "",
      body.action,
    );
    return NextResponse.json(result);
  }

  try {
    const url = await getCheckoutUrl(user.id, body.tier);
    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "결제 세션 생성에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
