"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/ui/button";

const POLL_INTERVAL_MS = 2_500;
const POLL_TIMEOUT_MS = 40_000;

type PollState = "polling" | "success" | "timeout" | "error";

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");

  const [state, setState] = useState<PollState>("polling");
  const [elapsedMs, setElapsedMs] = useState(0);
  // Initialized to 0; set in the effect to avoid calling Date.now() during render.
  const startedAt = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function poll() {
    const elapsed = Date.now() - startedAt.current;
    setElapsedMs(elapsed);

    if (elapsed >= POLL_TIMEOUT_MS) {
      stopPolling();
      setState("timeout");
      return;
    }

    try {
      const res = await fetch("/api/billing");
      if (!res.ok) {
        stopPolling();
        setState("error");
        return;
      }
      const { plan } = (await res.json()) as { plan: string };
      if (plan !== "free") {
        stopPolling();
        setState("success");
        // Give the success animation a moment to show before navigating.
        setTimeout(() => router.push("/dashboard?upgraded=true"), 1_500);
      }
    } catch {
      stopPolling();
      setState("error");
    }
  }

  useEffect(() => {
    startedAt.current = Date.now(); // Initialize here to avoid impure call during render.
    // Kick off immediately then repeat.
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPct = Math.min((elapsedMs / POLL_TIMEOUT_MS) * 100, 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-6">
        {state === "polling" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-[#1B3A6B] animate-spin" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">결제 처리 중</h1>
              <p className="text-sm text-slate-500 mt-1">
                결제를 확인하고 있습니다. 잠시만 기다려 주세요.
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B3A6B] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {checkoutId && (
              <p className="text-xs text-slate-400 font-mono">
                {checkoutId.slice(0, 16)}…
              </p>
            )}
          </>
        )}

        {state === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">결제 완료!</h1>
              <p className="text-sm text-slate-500 mt-1">
                플랜이 업그레이드되었습니다. 대시보드로 이동합니다…
              </p>
            </div>
          </>
        )}

        {state === "timeout" && (
          <>
            <div className="flex justify-center">
              <Clock className="w-12 h-12 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">처리 시간이 지연되고 있습니다</h1>
              <p className="text-sm text-slate-500 mt-1">
                결제는 완료되었으나 확인이 늦어지고 있습니다. 잠시 후 대시보드를
                새로고침하거나 문의해 주세요.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  startedAt.current = Date.now();
                  setState("polling");
                  poll();
                  intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
                }}
                className="w-full bg-[#1B3A6B] hover:bg-[#15305a] text-white"
              >
                다시 확인
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="w-full text-slate-500"
              >
                대시보드로 이동
              </Button>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">오류가 발생했습니다</h1>
              <p className="text-sm text-slate-500 mt-1">
                상태 확인 중 오류가 발생했습니다. 대시보드에서 플랜 상태를 확인해
                주세요.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-[#1B3A6B] hover:bg-[#15305a] text-white"
            >
              대시보드로 이동
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
