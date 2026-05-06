import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              R
            </div>
            <span className="text-lg font-bold text-slate-900">렌트키퍼</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
              요금제
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pt-24 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            임대인의 계약 관리,
            <br />
            <span className="text-blue-600">자동화하세요</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
            만기 알림, 갱신 제안서 발송, OCR 계약서 추출까지.
            소규모 임대인을 위한 올인원 계약 수명주기 관리 SaaS입니다.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              요금제 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            계약 관리의 모든 것
          </h2>
          <p className="mt-2 text-center text-slate-500">
            복잡한 관리를 자동화하여 핵심 업무에 집중하세요
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "OCR 계약서 추출",
                desc: "계약서 사진을 업로드하면 주요 정보를 자동으로 추출합니다.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                ),
              },
              {
                title: "만기 알림",
                desc: "D-90, D-60, D-30, D-7 다채널 알림으로 놓치지 않습니다.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                ),
              },
              {
                title: "갱신 제안서",
                desc: "인상률 자동 계산, 임차인 응답 추적까지 한 번에.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                  </svg>
                ),
              },
              {
                title: "커뮤니케이션 이력",
                desc: "발송, 열람, 응답 이력을 시간순으로 추적합니다.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                ),
              },
              {
                title: "상태 기계",
                desc: "9단계 계약 상태 관리로 정확한 수명주기를 추적합니다.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ),
              },
              {
                title: "보안 결제",
                desc: "Polar 기반 안전한 결제로 Pro/Business 플랜을 이용하세요.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            지금 시작하세요
          </h2>
          <p className="mt-2 text-slate-500">
            Free 플랜으로 계약 3건까지 무료 관리. 언제든 업그레이드할 수 있습니다.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">
          © 2026 렌트키퍼. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
