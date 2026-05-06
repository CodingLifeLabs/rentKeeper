import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/service/auth";
import { getCurrentSubscription, canPerformAction, getCheckoutUrl } from "@/service/billing";
import { getLandlordByUserId } from "@/repo/landlord";
import type { PlanTier } from "@/types/billing";

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
  const plan = subscription?.status === "active" ? subscription.planTier : "free";

  return NextResponse.json({ plan, subscription });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await request.json() as { tier?: string; action?: string };
  if (!body.tier && !body.action) {
    return NextResponse.json({ error: "tier 또는 action이 필요합니다." }, { status: 400 });
  }

  if (body.action) {
    const result = await canPerformAction(
      (await getLandlordByUserId(user.id))?.id ?? "",
      body.action as "create_contract" | "use_ocr" | "send_proposal" | "use_communication" | "use_branding",
    );
    return NextResponse.json(result);
  }

  try {
    const url = await getCheckoutUrl(user.id, body.tier as PlanTier);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "결제 세션 생성에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
