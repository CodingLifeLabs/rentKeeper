# Polar 구독제 구현 계획 (v1.0)

> **상태**: 기존 Sprint 5 구현을 보안·엣지케이스 측면에서 재검토한 강화 계획.
> **선행 작업**: `acdc534 feat: Sprint 5 — Polar billing` 에서 기본 골격은 완료.
> **목표**: 프로덕션 결제 사고 0건. 모든 시나리오에서 데이터 정합성 유지.

---

## 1. 현재 구현 상태 요약 (Sprint 5 결과물)

| 영역 | 파일 | 상태 |
|------|------|------|
| Polar 클라이언트 | `src/service/billing.ts` | 작동, 보안 강화 필요 |
| 웹훅 수신 | `src/app/api/webhooks/polar/route.ts` | 서명 검증 OK, 처리 로직 취약 |
| 체크아웃 생성 | `src/app/api/billing/route.ts` | 작동, 검증 부족 |
| 플랜 정의 | `src/config/plans.ts` | 정의 OK, 한도 enforcement 누락 |
| Repo | `src/repo/subscription.ts` | 기본 CRUD 완료 |
| 타입 | `src/types/billing.ts` | OK |

---

## 2. 요금제 재정의 (한도 기능 명세)

### 2.1 플랜별 한도 (현재 + 강화)

| 항목 | Free | Pro (₩9,900) | Business (₩24,900) |
|------|------|--------------|---------------------|
| 활성 계약 (active/expiring/negotiating) | 3 | 20 | 100 |
| 보관 계약 (archived) | 무제한 | 무제한 | 무제한 |
| OCR 사용 | ✗ | ✓ | ✓ |
| 갱신 제안서 발송 | ✗ | ✓ | ✓ |
| 커뮤니케이션 이력 | ✗ | ✓ | ✓ |
| 만기 알림 채널 | Email | Email + Push | Email + Push + Kakao |
| 보관함 용량 | 0.5 GB | 5 GB | 50 GB |
| 커스텀 브랜딩 | ✗ | ✗ | ✓ |
| 데이터 export (CSV/Excel/ZIP) | CSV만 | 전체 | 전체 + 자동백업 |
| API rate limit (체크아웃 호출) | 5/min | 10/min | 30/min |

### 2.2 한도 체크 시점 (TOCTOU 방지)

| 액션 | 체크 위치 | 구현 방식 |
|------|-----------|-----------|
| 계약 생성 | DB INSERT 트리거 + service 사전 체크 | Postgres `BEFORE INSERT` 트리거에서 한도 검사 + 응용 레이어 사전 검증 |
| OCR 호출 | service 진입점 | `canPerformAction("use_ocr")` 호출 |
| 파일 업로드 | Supabase Storage 정책 | `storage.objects` 용량 체크 함수 + 클라이언트 사전 검증 |
| 갱신 제안서 | service 진입점 | `canPerformAction("send_proposal")` |

> **중요**: 응용 레이어 사전 체크만으로는 동시 요청 시 한도 초과 가능. **DB 레벨 트리거가 최종 방어선**.

### 2.3 다운그레이드 시 한도 초과 처리

**시나리오**: Pro(20건 사용 중) → Free(3건 한도) 다운그레이드.

**정책**:
1. 다운그레이드 즉시 시점에 `over_limit_grace_period_end = now() + 14일` 설정.
2. Grace 기간 동안: 신규 계약 생성 차단(읽기는 허용), 배너로 "X건이 한도 초과 — 14일 내 정리 필요" 표시.
3. Grace 만료 후: 가장 오래된 active 계약부터 자동 `archived` 전환 (사용자 데이터는 보존).
4. **데이터 삭제 절대 금지** — 보관함은 유지, UI 가시성만 제한.

---

## 3. Polar 상품 등록 가이드

### 3.1 Polar Dashboard 등록 절차

1. **계정 생성**: <https://polar.sh> → GitHub 또는 이메일로 가입.
2. **Organization 생성**: `RentKeeper` (production) / `RentKeeper Sandbox` (staging) 분리.
3. **Sandbox 우선 검증**:
   - `https://sandbox.polar.sh` 에서 동일 상품 구조 미리 등록.
   - `POLAR_SERVER=sandbox` 환경변수로 코드 검증.
4. **Product 등록** (Pro/Business 각각):
   - **Type**: `Subscription` (구독)
   - **Name**: `RentKeeper Pro` / `RentKeeper Business`
   - **Price**: KRW 9,900 / 24,900 (월간)
   - **Recurring interval**: monthly
   - **Description**: 한국어 + 영어 병기
   - **Tax behavior**: `inclusive` (한국 부가세 포함)
5. **Product ID / Price ID 저장**:
   - 등록 후 발급되는 ID를 `.env.local` 및 Vercel 환경변수에 저장.
6. **Webhook endpoint 등록**:
   - URL: `https://app.rentkeeper.kr/api/webhooks/polar`
   - Secret: 자동생성 → `POLAR_WEBHOOK_SECRET`로 저장
   - 구독 이벤트 전체 선택:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.active`
     - `subscription.canceled`
     - `subscription.uncanceled`
     - `subscription.revoked`
     - `subscription.past_due`
     - `checkout.created` (감사용)
     - `checkout.updated` (감사용)
7. **Customer Portal 활성화**: Polar에서 셀프서비스 포털 URL 발급받아 설정 페이지에 노출.
8. **Tax ID 등록**: 한국 사업자등록번호 입력 (세금계산서 자동 발행).

### 3.2 환경변수 분류 (보안 강화)

| 변수 | 노출 범위 | 비고 |
|------|-----------|------|
| `POLAR_ACCESS_TOKEN` | **서버 only** | 절대 `NEXT_PUBLIC_` 금지 |
| `POLAR_WEBHOOK_SECRET` | **서버 only** | 절대 `NEXT_PUBLIC_` 금지 |
| `POLAR_SERVER` | 서버 only | `sandbox` / `production` |
| `POLAR_PRO_PRODUCT_ID` | **서버 only** | 현재 `NEXT_PUBLIC_*`로 노출됨 → **수정 필요** |
| `POLAR_PRO_PRICE_ID` | 서버 only | 동일 |
| `POLAR_BUSINESS_PRODUCT_ID` | 서버 only | 동일 |
| `POLAR_BUSINESS_PRICE_ID` | 서버 only | 동일 |
| `NEXT_PUBLIC_BASE_URL` | 클라이언트 OK | 단, 프로덕션에서는 필수 — fallback `localhost` 제거 |

> **현재 코드 결함**: `src/config/plans.ts`에서 `NEXT_PUBLIC_POLAR_*_PRODUCT_ID`로 정의되어 있음. Product ID는 비밀은 아니지만 클라이언트에서 직접 결제 호출 가능성을 차단하기 위해 서버 전용으로 옮길 것.

---

## 4. 보안 강화 항목 (CRITICAL → LOW 순)

### 4.1 [CRITICAL] 웹훅 메타데이터 신뢰 문제

**현재 코드** (`src/service/billing.ts:127-130`):
```ts
const metadata = data.metadata as Record<string, string> | null;
const landlordId = metadata?.landlordId;
const planTier = metadata?.planTier as PlanTier | undefined;
```

**문제**: 웹훅 payload의 `metadata.landlordId` / `metadata.planTier`를 그대로 신뢰. Polar 서명 검증은 했지만, 만약 metadata가 사용자 측에서 조작 가능한 채로 전달되면 권한 상승 위험.

**수정**:
1. `planTier`는 metadata가 아닌 `data.product.id`를 통해 서버 측 매핑에서 도출.
2. `landlordId`는 `externalCustomerId`를 우선 신뢰하고, metadata는 백업으로만 사용.
3. landlord 존재 여부 검증 + 해당 landlord의 user_id가 실재하는지 추가 체크.
4. `planTier ∈ {'free','pro','business'}` 화이트리스트 검증.

```ts
// 강화 패턴 (의사 코드)
const productId = (data.product as {id: string})?.id;
const planTier = mapProductIdToTier(productId);  // 서버 화이트리스트
if (!planTier) return; // unknown product → 무시 + 알람

const landlordId = (data.customer as {externalId?: string})?.externalId
  ?? metadata?.landlordId;
if (!landlordId || !await landlordExists(landlordId)) {
  await logSecurityEvent('webhook_unknown_landlord', { polarSubId });
  return;
}
```

### 4.2 [CRITICAL] 웹훅 idempotency 부재

**문제**: Polar는 동일 이벤트를 재시도 가능. 현재 핸들러는 같은 이벤트가 두 번 오면 두 번 처리 → 중복 행 / 잘못된 상태.

**수정**:
1. `webhook_events` 테이블 신규 추가:
   ```sql
   CREATE TABLE webhook_events (
     polar_event_id TEXT PRIMARY KEY,
     event_type TEXT NOT NULL,
     received_at TIMESTAMPTZ DEFAULT now(),
     processed_at TIMESTAMPTZ,
     payload JSONB NOT NULL
   );
   ```
2. 처리 전: `INSERT ... ON CONFLICT DO NOTHING` → 충돌 시 즉시 200 반환 (이미 처리).
3. 처리 후: `processed_at = now()` 업데이트.
4. 30일 이상 된 event 자동 삭제 cron.

### 4.3 [CRITICAL] 웹훅에서 Service Role 클라이언트 미사용

**문제**: `repo/subscription.ts`가 `createServerSupabaseClient()` 사용. 웹훅은 사용자 컨텍스트가 없어 RLS가 INSERT/UPDATE 차단 가능.

**수정**:
1. `src/repo/supabase-admin.ts` 신설 — `SUPABASE_SERVICE_ROLE_KEY` 사용하는 admin 클라이언트.
2. `subscription.ts`의 webhook 경로 함수만 admin 클라이언트 사용 (별도 함수 분리).
3. RLS 정책에서 service_role은 우회되도록 구성.
4. `SUPABASE_SERVICE_ROLE_KEY`는 웹훅 라우트와 cron 등 서버 only 경로에서만 import.

### 4.4 [HIGH] 웹훅 timestamp 검증 부재 (replay attack)

**현재**: `validateEvent()`는 서명만 검증. timestamp 신선도 검증 없음.

**수정**:
- 웹훅 헤더의 `webhook-timestamp`를 확인. `now() - timestamp > 5분` 이면 거부.
- `@polar-sh/sdk/webhooks`가 자동으로 처리하는지 검증 후, 미지원 시 수동 구현.

### 4.5 [HIGH] /api/billing rate limiting 부재

**문제**: 인증된 사용자가 무한히 체크아웃 호출 가능 → Polar API quota 소진 / 결제 페이지 스팸.

**수정**:
- Vercel Edge Config 기반 KV로 `landlordId:billing` 키에 토큰버킷 적용.
- Free: 5/min, Pro/Business: 10~30/min.
- 초과 시 429 + `Retry-After`.

### 4.6 [HIGH] `getCheckoutUrl` 입력 검증 부재

**현재**:
```ts
const url = await getCheckoutUrl(user.id, body.tier as PlanTier);
```

**문제**: `body.tier`가 `"free"`이거나 미지의 문자열이어도 통과. `as` 캐스팅으로 타입 시스템 우회.

**수정**: zod 스키마 도입.
```ts
const checkoutSchema = z.object({
  tier: z.enum(['pro', 'business']),  // free 제외
});
const { tier } = checkoutSchema.parse(await request.json());
```

### 4.7 [HIGH] TOCTOU — 계약 생성 한도 체크

**현재**: `canPerformAction` → `count < limit` 확인 후 INSERT. 두 단계 사이 race.

**수정**:
1. Postgres 트리거 추가:
   ```sql
   CREATE OR REPLACE FUNCTION enforce_contract_limit()
   RETURNS TRIGGER AS $$
   DECLARE
     current_count INT;
     plan_limit INT;
   BEGIN
     SELECT max_contracts INTO plan_limit
     FROM plan_limits_for_landlord(NEW.landlord_id);
     SELECT COUNT(*) INTO current_count
     FROM contracts
     WHERE landlord_id = NEW.landlord_id
       AND status NOT IN ('archived');
     IF current_count >= plan_limit THEN
       RAISE EXCEPTION 'CONTRACT_LIMIT_EXCEEDED';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```
2. 응용 레이어는 친절한 메시지를 위해 사전 체크 유지 (UX), DB가 최종 방어.

### 4.8 [HIGH] 웹훅 처리 실패 시 retry 의미 부재

**현재**: catch에서 500 반환. Polar 자동 재시도 OK이나 실패 원인 로깅 없음.

**수정**:
1. `webhook_events.processed_at = NULL` + `last_error TEXT` + `attempt_count INT` 추가.
2. 모든 실패는 `webhook_events`에 보존 + Sentry / 로그 시스템에 alert.
3. 5회 연속 실패 시 dead-letter로 분리 + 운영자 통보.

### 4.9 [MEDIUM] 타입 안전성 — webhook handler

**현재**: `as` 캐스팅 남발 (`payload.type as string`, `data.id as string` 등).

**수정**: zod로 Polar 이벤트 페이로드 스키마 정의 + 검증.
```ts
const subscriptionEventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    customer: z.object({ id: z.string(), externalId: z.string().nullable() }),
    product: z.object({ id: z.string() }),
    metadata: z.record(z.string()).nullable(),
    currentPeriodStart: z.string().datetime().nullable(),
    currentPeriodEnd: z.string().datetime().nullable(),
  }),
});
```

### 4.10 ~~[MEDIUM] `subscription.updated` / `uncanceled` 핸들러 누락~~ ✅ Sprint A에서 완료

`subscription.updated`, `subscription.uncanceled` 모두 `handleWebhookEvent`에 구현됨.

### 4.11 [MEDIUM] `NEXT_PUBLIC_BASE_URL` localhost fallback

**현재**:
```ts
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
```

**수정**: 프로덕션에서 미설정 시 throw. 개발 환경만 fallback.
```ts
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ?? (process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('NEXT_PUBLIC_BASE_URL required'); })()
    : 'http://localhost:3000');
```

### 4.12 [MEDIUM] 동시 활성 구독 방지

**문제**: `getSubscriptionByLandlord`가 `status='active'`만 필터. 만약 `past_due` 행이 있는 상태에서 새 결제가 들어오면 두 행이 공존 가능.

**수정**:
1. `subscriptions` 테이블에 partial unique index:
   ```sql
   CREATE UNIQUE INDEX one_active_subscription_per_landlord
   ON subscriptions(landlord_id)
   WHERE status IN ('active','past_due');
   ```
2. webhook 처리 시 기존 active/past_due 행을 모두 조회하여 단일 행만 유지.

### 4.13 [LOW] 감사 로그

**추가**: `audit_logs` 테이블에 모든 결제 관련 이벤트 기록.
- `checkout_initiated`, `subscription_changed`, `webhook_received`, `limit_exceeded`, `downgrade_grace_started`.

### 4.14 [LOW] CSP / 헤더

웹훅 라우트에는 `Content-Security-Policy: default-src 'none'`, 일반 결제 페이지에는 Polar JS SDK origin 화이트리스트.

---

## 4-B. Sprint A 구현 검토 중 추가 발견 사항

### 4-B.1 [HIGH] `subscription.created` — landlord 존재 여부 미검증

**현재 구현** (`src/service/billing.ts`):
```ts
const landlordId = sub.metadata["landlordId"] as string | undefined;
if (!landlordId) return;
const existing = await getSubscriptionByLandlord(landlordId, admin);
// landlord가 DB에 실재하는지 확인하지 않고 바로 createSubscription 호출
```

**문제**: `landlordId`가 metadata에 존재하더라도 해당 landlord 행이 DB에 없는 경우(계정 삭제, 데이터 불일치 등) `createSubscription`이 FK 위반으로 실패하고 500 반환 → Polar가 무한 재시도. 계획 4.1에서 명시한 "landlord 존재 여부 검증"이 미구현 상태.

**수정 방향** (Sprint B 또는 C):
```ts
// getLandlordById 추가 후
const landlord = await getLandlordById(landlordId, admin);
if (!landlord) {
  // 무시 + 보안 이벤트 로그, 200 반환
  await logSecurityEvent('webhook_unknown_landlord', { landlordId, polarSubId: sub.id });
  return;
}
```

### 4-B.2 [MEDIUM] `webhook_events` 스키마 — 재시도 추적 미구현

**현재 스키마** (`sql/webhook_events.sql`):
```sql
id, event_id, event_type, processed_at
```

**계획서 4.2 및 4.8에서 제안한 스키마**:
```sql
payload JSONB, last_error TEXT, attempt_count INT
```

**문제**: 웹훅 처리 실패 시 오류 원인과 재시도 횟수를 추적할 수 없음. dead-letter 큐(4.8) 구현 불가.

**수정 방향** (Sprint C):
- 마이그레이션으로 `last_error TEXT`, `attempt_count INT DEFAULT 0` 컬럼 추가
- `markWebhookEventProcessed` 실패 경로에서 `last_error` 업데이트

### 4-B.3 [MEDIUM] replay attack 방어 — SDK 동작 검증 필요

**현재**: `validateEvent(body, headers, secret)`에 전적으로 의존. `@polar-sh/sdk`가 `webhook-timestamp` 신선도(5분 이내)를 자동으로 검증하는지 확인되지 않음.

**확인 필요**: `node_modules/@polar-sh/sdk/webhooks` 소스 코드에서 timestamp 검증 여부 확인.
- SDK가 처리한다면 → 4.4 완료로 마킹
- 미처리라면 → 웹훅 라우트에 수동 검증 추가:
  ```ts
  const ts = Number(headers["webhook-timestamp"]);
  if (Math.abs(Date.now() / 1000 - ts) > 300) {
    return NextResponse.json({ error: "Stale webhook" }, { status: 401 });
  }
  ```

### 4-B.4 [LOW] `subscription.created` vs `subscription.active` 중복 처리

**현재**: 두 이벤트를 동일 로직으로 처리 (같은 case 블록). Polar에서 두 이벤트가 연속 발송될 경우 두 번째는 idempotency에서 차단되나, `event_type`이 다르면 별도 행으로 기록되어 동일 구독을 두 번 UPDATE.

**수정 방향**: `getSubscriptionByPolarId`로 먼저 조회하여 이미 처리된 구독이면 UPDATE만 수행 (현재 `subscription.created`는 `getSubscriptionByLandlord`로 조회). 또는 `subscription.created`에서는 INSERT만, `subscription.active`에서는 UPDATE만 처리하도록 분리.

---

## 5. 시나리오 매트릭스 (모든 상황 대응)

각 시나리오마다 **트리거 / 기대 동작 / 실패 모드 / 검증 방법** 명시.

### 5.1 정상 흐름

| ID | 시나리오 | 기대 동작 | 검증 |
|----|----------|-----------|------|
| S01 | Free 사용자 Pro 결제 성공 | checkout → webhook(`active`) → DB upsert → UI 즉시 잠금 해제 | E2E + webhook 모킹 |
| S02 | Pro → Business 업그레이드 | checkout → webhook(`updated`) → planTier 갱신 → 한도 즉시 확장 | E2E |
| S03 | Pro → Free 다운그레이드 | Polar Portal cancel → webhook(`canceled`, `cancel_at_period_end=true`) → 기간 만료 시 `revoked` → grace 시작 | webhook 모킹 |
| S04 | 결제 취소 철회 | Polar Portal "Resume" → webhook(`uncanceled`) → `cancel_at_period_end=false` 복원 | webhook 모킹 |

### 5.2 결제 실패 / 지연

| ID | 시나리오 | 기대 동작 |
|----|----------|-----------|
| S10 | 카드 거절 | checkout 페이지에서 Polar가 처리, 우리는 webhook 받지 않음. 사용자는 free 유지. |
| S11 | 갱신 결제 실패(past_due) | webhook(`past_due`) → status 변경, 기능은 7일까지 유지(grace) → `revoked` 시 free로 |
| S12 | 환불 발생 | webhook(`refunded`) — 현재 미처리. **추가 필요**: status `refunded`로, 즉시 free 전환 + 알람 |
| S13 | Polar API 5xx | checkout 생성 실패 → 사용자에게 친절한 메시지 + 재시도 버튼, 30초 후 자동 재시도 |
| S14 | webhook 5xx 후 자체 복구 | Polar 재시도 → idempotency로 안전 처리 |

### 5.3 보안 / 악용 시나리오

| ID | 시나리오 | 기대 동작 |
|----|----------|-----------|
| S20 | 위조 webhook (잘못된 서명) | 401 반환, 처리 안 함, 보안 로그 기록 |
| S21 | 정상 webhook 재전송 (replay) | idempotency 테이블이 차단, 200 반환 |
| S22 | metadata 조작된 webhook | productId 기반 화이트리스트가 차단, landlord 검증 실패 시 무시 |
| S23 | 같은 사용자가 다중 탭에서 동시에 계약 4건 생성 (Free 한도 3) | DB 트리거가 4번째 INSERT 차단, 응용 레이어가 친절한 에러 표시 |
| S24 | 결제 후 webhook 도달 전 사용자 새로고침 | 사용자에게 "결제 처리 중" 표시 + Polar checkout API로 폴링 fallback |
| S25 | 사용자가 다른 계정의 landlordId로 checkout 호출 | `getLandlordByUserId(currentUserId)` 사용하므로 자동 차단, externalCustomerId 검증 |
| S26 | webhook이 존재하지 않는 landlord 참조 | 무시 + 알람, 200 반환(Polar 재시도 방지) |
| S27 | rate limit 우회 시도 | 토큰버킷이 IP+landlordId 조합으로 차단 |
| S28 | 만료 후에도 OCR API 호출 시도 | service 레이어 진입점에서 `canPerformAction` 차단 (UI 우회 방지) |

### 5.4 상태 동기화 엣지케이스

| ID | 시나리오 | 기대 동작 |
|----|----------|-----------|
| S30 | webhook이 순서 뒤바뀌어 도착 (`canceled` → `active`) | `webhook_events`에 timestamp 기록, 최신 timestamp만 반영하는 reconciliation 로직 |
| S31 | DB에는 active인데 Polar에는 canceled | 일 1회 cron으로 Polar 상태와 동기화 |
| S32 | 동일 landlord 중복 active 행 발생 | partial unique index가 차단, 기존 행 만료 처리 후 새 행 INSERT |
| S33 | Polar 다운타임 중 사용자 가입 | checkout 호출 실패 → 큐에 적재, 복구 후 자동 재시도 (선택적) |
| S34 | 사용자 계정 삭제 후 webhook 도착 | landlord 부재 → 무시 + 알람, 200 반환 |
| S35 | 한 사용자가 여러 landlord 보유 시 (현재는 1:1) | 미지원 → checkout API에서 명시적 거절, 향후 확장 시 별도 설계 |

### 5.5 데이터 일관성

| ID | 시나리오 | 기대 동작 |
|----|----------|-----------|
| S40 | 다운그레이드 → 한도 초과 계약 | 14일 grace, 자동 archive, 데이터 보존 |
| S41 | 보관함 용량 초과 후 다운그레이드 | 신규 업로드 차단, 기존 파일 보존, 다운로드 가능 |
| S42 | 결제 환불 후 Pro 기능 사용 시도 | 즉시 차단, "구독이 만료되었습니다" 안내 |
| S43 | Free 사용자가 OCR 직접 API 호출 | service 레이어에서 차단, 401/403 반환 |

---

## 6. 구현 스프린트 분해

### Sprint A (1주차) — 보안 핵심 ✅ 완료
- [x] `webhook_events` 테이블 + idempotency (`sql/webhook_events.sql`, `src/repo/webhook.ts`)
- [x] `supabase-admin.ts` (service role) — `src/repo/supabase-admin.ts`
- [x] webhook handler를 admin 클라이언트로 마이그레이션 — `src/service/billing.ts`
- [x] productId → planTier 화이트리스트 매핑 — `getTierByProductId()` in `src/config/plans.ts`
- [x] `NEXT_PUBLIC_POLAR_*_PRODUCT_ID` → `POLAR_*_PRODUCT_ID` 이전
- [x] `NEXT_PUBLIC_BASE_URL` 프로덕션 강제
- [x] Zod 스키마 검증 — `src/app/api/billing/route.ts` (`checkoutSchema`, `actionSchema`)
- [x] `subscription.updated` / `uncanceled` 핸들러 구현 (4.10 → Sprint A에서 선반영)
- [x] TypeScript 빌드 오류 수정 — `database.ts` 전 테이블에 `Relationships: []` 추가, `subscription.ts` Update 타입 강화
- [x] `zod` 직접 의존성 추가 (`pnpm add zod`)

> **미이행 항목** (Sprint A 원안에 있었으나 이후 스프린트로 이동):
> - zod 기반 webhook payload 스키마 검증 → **Sprint C**로 이동 (SDK 타입 활용 중)

### Sprint B (2주차) — 한도·TOCTOU ✅ 완료
- [x] 계약 한도 DB 트리거 (`sql/sprint_b_migrations.sql`)
- [x] partial unique index (subscriptions) (`sql/sprint_b_migrations.sql`)
- [x] `canPerformAction`에 `archived` 제외 (`src/repo/subscription.ts`)
- [x] /api/billing rate limiting (`src/app/api/billing/route.ts`)
- [x] zod 입력 검증 (checkoutSchema) — Sprint A에서 선반영, Sprint B에서 확인

### Sprint C (3주차) — 시나리오 커버 ✅ 완료
- [x] `subscription.updated` / `uncanceled` 핸들러 — Sprint A에서 선반영
- [x] `refunded` 이벤트 처리 (`src/service/billing.ts`)
- [x] 다운그레이드 grace period 로직 (`sql/sprint_c_migrations.sql`)
- [x] Polar 상태 동기화 cron (일 1회) (`src/app/api/cron/sync-subscriptions/route.ts`)
- [x] dead-letter 큐 (`sql/sprint_c_migrations.sql`, `src/app/api/cron/cleanup-webhooks/route.ts`)

### Sprint D (4주차) — UX·운영 ✅ 완료
- [x] Customer Portal 링크 노출 (설정 페이지) (`src/app/(protected)/settings/page.tsx`)
- [x] "결제 처리 중" 폴링 UX (`src/app/(protected)/billing/success/page.tsx`)
- [x] 감사 로그 + Sentry alert (`src/service/audit-log.ts`, `src/repo/audit-log.ts`)
- [x] Polar Sandbox 상품 등록 완료 (Pro: bad9a283, Business: d393a4c3)
- [x] Webhook endpoint 등록 + `POLAR_WEBHOOK_SECRET` 확보
- [x] `.env.local` 모든 Polar 환경변수 업데이트
- [ ] 모든 시나리오 E2E 테스트 (향후 진행)

---

## 7. 테스트 전략

### 7.1 단위 테스트 (Vitest)
- `service/billing.ts`: webhook 페이로드 변형(잘못된 metadata, 알 수 없는 productId, 누락 필드 등) 20+ 케이스.
- `service/billing.ts`: `canPerformAction` 모든 분기 + status별 조합.
- `repo/subscription.ts`: idempotency, partial unique index 충돌.

### 7.2 통합 테스트
- Supabase 로컬 + Polar Sandbox 조합.
- 계약 한도 트리거가 동시 INSERT를 차단하는지 (race 시뮬레이션).

### 7.3 E2E (Playwright)
- 시나리오 S01~S04, S20~S25, S40~S42 (총 ~15개).
- Polar Sandbox checkout 페이지에서 테스트 카드 사용 (Polar 가이드 카드번호).

### 7.4 카오스 / 보안 테스트
- 위조 서명 webhook 요청 → 401.
- 1분간 100회 checkout 호출 → 429 발생 확인.
- 동일 webhook 5회 연속 재전송 → 1번만 처리됨 확인.

---

## 8. 운영 / 모니터링

| 지표 | 임계값 | 알람 |
|------|--------|------|
| webhook 처리 성공률 | < 99% | 즉시 |
| webhook 처리 평균 시간 | > 2s | warn |
| dead-letter 적재 | ≥ 1건 | 즉시 |
| /api/billing 5xx 비율 | > 1% | 즉시 |
| 활성 구독 ↔ Polar 불일치 | ≥ 1건 | 일일 리포트 |
| rate limit 차단 | landlord별 일 100건 초과 | 보안팀 |

---

## 9. 환경변수 체크리스트 (배포 전)

### Sandbox (개발 환경) ✅ 완료
- [x] `POLAR_ACCESS_TOKEN` — `polar_oat_xgyfFW...` (만료: 2026-06-07)
- [x] `POLAR_WEBHOOK_SECRET` — 등록 완료 (endpoint id: b5186764)
- [x] `POLAR_SERVER=sandbox`
- [x] `POLAR_PRO_PRODUCT_ID=bad9a283-403e-4e5d-921c-bb8cd69c1fab`
- [x] `POLAR_PRO_PRICE_ID=b49e5988-baf0-40c4-88f2-eebe7c6dab21`
- [x] `POLAR_BUSINESS_PRODUCT_ID=d393a4c3-a6d9-4284-80d9-658ddcc3a559`
- [x] `POLAR_BUSINESS_PRICE_ID=c708634a-3f4f-4719-bcef-6c5017f47c3d`

### Production (배포 전 필요)
- [ ] `POLAR_ACCESS_TOKEN` (production token, 저장소 commit 금지)
- [ ] `POLAR_WEBHOOK_SECRET` (Polar dashboard에서 발급)
- [ ] `POLAR_SERVER=production`
- [ ] `POLAR_PRO_PRODUCT_ID` (production 상품 등록 후)
- [ ] `POLAR_PRO_PRICE_ID` (production 상품 등록 후)
- [ ] `POLAR_BUSINESS_PRODUCT_ID` (production 상품 등록 후)
- [ ] `POLAR_BUSINESS_PRICE_ID` (production 상품 등록 후)
- [ ] `NEXT_PUBLIC_BASE_URL=https://app.rentkeeper.kr` (필수)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (서버 only, RLS 우회용)
- [ ] Vercel 환경변수에 `Production` / `Preview` 분리 등록
- [ ] `.env.example` 갱신 (실제 값 대신 placeholder)

---

## 10. PMF 필터 통과 확인

- [x] **리텐션**: 구독자가 매달 가치를 받지 못하면 즉시 해지. 한도/기능 매칭이 핵심.
- [x] **습관**: 매월 결제 갱신 자체가 습관 형성 신호.
- [x] **Agentic 결과물**: Pro 이상에서 OCR/제안서 자동화가 차별점.
→ 통과. 구현 진행.

---

## 11. 변경 이력

- v1.0 (2026-05-08): 초안. Sprint 5 결과물 기반 보안·시나리오 강화.
- v1.1 (2026-05-08): Sprint A 완료 현황 반영. 구현 검토 중 발견한 추가 보안 갭 4건(4-B.1~4-B.4) 추가. 4.10 완료 처리.
- v1.2 (2026-05-08): Sprint B/C/D 완료 반영. Polar Sandbox 상품 등록(Pro/Business), webhook endpoint 등록, `.env.local` 모든 환경변수 업데이트 완료.

---

## 부록 A. 참고 자료

- Polar SDK: `node_modules/@polar-sh/sdk/webhooks` (validateEvent 시그니처 검증)
- Polar Webhooks 공식 가이드: <https://docs.polar.sh/integrate/webhooks>
- Vercel Functions cold start 대응: 웹훅 라우트는 fluid compute로 graceful shutdown 안전.
- 한국 결제 부가세: Polar의 `tax_inclusive` 플래그 활용.
