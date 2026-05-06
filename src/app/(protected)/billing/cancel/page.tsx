import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">결제가 취소되었습니다</h1>
        <p className="mt-2 text-slate-500">언제든 다시 시도할 수 있습니다.</p>
        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          요금제로 돌아가기
        </Link>
      </div>
    </div>
  );
}
