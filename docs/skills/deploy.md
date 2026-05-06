# 배포 절차

## 배포 전 체크리스트

### 1. 환경변수 (필수)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Polar (결제)
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_SERVER=production
NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID=
NEXT_PUBLIC_POLAR_PRO_PRICE_ID=
NEXT_PUBLIC_POLAR_BUSINESS_PRODUCT_ID=
NEXT_PUBLIC_POLAR_BUSINESS_PRICE_ID=

# App
NEXT_PUBLIC_URL=https://rentkeeper.app
```

### 2. Supabase 설정

#### 테이블 확인
- [ ] `landlords` — RLS 활성화
- [ ] `contracts` — RLS 활성화
- [ ] `properties` — RLS 활성화
- [ ] `notifications` — RLS 활성화
- [ ] `communications` — RLS 활성화
- [ ] `renewal_proposals` — RLS 활성화
- [ ] `subscriptions` — RLS 활성화

#### Auth 설정
- [ ] Google OAuth 앱 프로덕션 전환
- [ ] 이메일 로그인 활성화
- [ ] Site URL → 프로덕션 도메인
- [ ] Redirect URLs → 프로덕션 콜백 URL

### 3. Polar 설정

- [ ] 프로덕션 환경 활성화
- [ ] Pro/Business 제품 생성 (KRW 가격)
- [ ] Webhook 엔드포인트 등록: `https://rentkeeper.app/api/webhooks/polar`
- [ ] Webhook 이벤트: subscription.created, active, canceled, revoked, past_due

### 4. Harness 게이트 최종 확인

```bash
pnpm harness:lint        # 레이어 의존성 위반 0건
pnpm typecheck           # TypeScript 오류 0건
pnpm lint                # ESLint error 0건
pnpm test                # 커버리지 ≥ 80%
pnpm build               # 빌드 성공
```

## Vercel 배포

### 첫 배포

```bash
# Vercel CLI 설치 (필요 시)
pnpm add -g vercel

# 프로젝트 연결
vercel link

# 환경변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add POLAR_ACCESS_TOKEN production
vercel env add POLAR_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID production
vercel env add NEXT_PUBLIC_POLAR_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_POLAR_BUSINESS_PRODUCT_ID production
vercel env add NEXT_PUBLIC_POLAR_BUSINESS_PRICE_ID production
vercel env add NEXT_PUBLIC_URL production

# 배포
vercel --prod
```

### 이후 배포

```bash
vercel --prod
```

## 배포 후 검증

- [ ] 랜딩 페이지 로드 (/)
- [ ] 로그인 동작 (이메일 + Google)
- [ ] 대시보드 접근 (/dashboard)
- [ ] 계약 등록 (/contracts/new)
- [ ] 요금제 페이지 (/pricing)
- [ ] Polar 웹훅 수신 확인
- [ ] 만료 알림 크론 동작 (Vercel Cron 또는 external cron)

## 크론 작업

만기 알림은 `/api/cron/expiry-check` 엔드포인트를 호출:

- **Vercel Cron**: `vercel.json`에 설정
- **External**: cron-job.org 또는 GitHub Actions 스케줄러

```json
{
  "crons": [
    {
      "path": "/api/cron/expiry-check",
      "schedule": "0 9 * * *"
    }
  ]
}
```
