# Changelog

## [0.8.0] - 2026-05-08

### Added (Sprint B/C/D — Polar Billing 강화)

#### Sprint B — 한도·TOCTOU 방어
- 계약 한도 DB 트리거: `enforce_contract_limit()` BEFORE INSERT 트리거 (`sql/sprint_b_migrations.sql`)
- Partial unique index: `subscriptions(landlord_id)` WHERE active/past_due (동시 활성 구독 방지)
- `canPerformAction` 개선: archived 상태 계약 한도 집계 제외 (`src/repo/subscription.ts`)
- `/api/billing` rate limiting: landlord별 토큰버킷 적용, 429 + Retry-After 반환

#### Sprint C — 시나리오 커버
- `refunded` webhook 이벤트 처리: 즉시 free 전환 + 감사 로그 (`src/service/billing.ts`)
- 다운그레이드 grace period: 14일 유예 + 자동 archive 정책 (`sql/sprint_c_migrations.sql`)
- 구독 상태 동기화 cron: 일 1회 Polar 상태와 DB 정합성 검증 (`src/app/api/cron/sync-subscriptions/route.ts`)
- Webhook cleanup cron: 30일 이상 지난 이벤트 자동 삭제 (`src/app/api/cron/cleanup-webhooks/route.ts`)
- Dead-letter 큐: `attempt_count` + `last_error` 컬럼, 5회 연속 실패 시 분리

#### Sprint D — UX·운영
- Customer Portal 링크: 설정 페이지에 Polar 셀프서비스 포털 노출 (`src/app/(protected)/settings/page.tsx`)
- 결제 처리 중 폴링 UX: `/billing/success` 페이지에서 Polar checkout 상태 폴링 (`src/app/(protected)/billing/success/page.tsx`)
- 감사 로그: `audit_logs` 테이블 + service/repo 레이어 (`src/service/audit-log.ts`, `src/repo/audit-log.ts`)
- Polar Sandbox 상품 등록: RentKeeper Pro (bad9a283, ₩9,900/월), RentKeeper Business (d393a4c3, ₩24,900/월)
- Polar Webhook endpoint 등록: `https://rentkeeper.vercel.app/api/webhooks/polar`, 8개 이벤트 구독
- `.env.local` 모든 Polar 환경변수 업데이트 (POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET, 4개 Product/Price ID)
- Vercel cron jobs: `vercel.json`에 sync-subscriptions(매일 0시), cleanup-webhooks(매주 일요일 3시) 등록

## [0.7.0] - 2026-05-08

### Added (Sprint 10) — EVALUATOR PASS
- 계약 상세 페이지 (/contracts/[id]): 3-탭 구조 (정보/보관함/알림 이력)
- 계약서 보관함: Supabase Storage 파일 업로드/목록/다운로드/삭제
- 계약 정보 수정: 인라인 편집 모드 (임차인, 연락처, 보증금, 월세, 기간, 메모)
- 만료 알림 배너: expiring_90/30 상태 시 D-Day 경고 표시
- Storage bucket: contract-files (private, 10MB 제한)

### Fixed
- contract-files repo: 서비스 역할 키 사용으로 Storage RLS 우회 (인증은 route handler에서 처리)

## [0.6.0] - 2026-05-08

### Added (Sprint 9) — EVALUATOR PASS
- Resend 이메일 발송: lazy init 클라이언트, 만기 알림 HTML 템플릿
- 이메일 템플릿: 임차인명/만기일/주소/대시보드 링크 포함
- 대시보드 알림 버튼: expiring_90/30 계약에 Bell 아이콘 "알림" 버튼
- /api/notify: 알림 발송 → notifications + communications 테이블 기록
- CommunicationList 컴포넌트: 이메일/카카오 채널 아이콘, 타임스탬프
- RESEND_API_KEY 없으면 mock 모드 자동 전환

## [0.5.1] - 2026-05-08

### Added
- 알림 설정 영속화: notification_preferences 테이블 + CRUD repo
- /api/notifications/settings GET/PUT 엔드포인트
- 알림 설정 폼: 서버에서 설정 로드/저장, 로딩 상태 표시

## [0.5.0] - 2026-05-06

### Added (Sprint 5) — EVALUATOR PASS
- Polar SDK 연동: checkout 세션 생성, 웹훅 서명 검증, 구독 라이프사이클 관리
- 플랜 티어: Free (3건), Pro (₩9,900/20건/OCR), Business (₩24,900/100건/브랜딩)
- 결제 서비스: getCurrentSubscription, canPerformAction (플랜별 제한 체크)
- 구독 repo: functional 패턴 (getSubscriptionByLandlord, create, update, countContracts)
- 웹훅 핸들러: /api/webhooks/polar (subscription.created/active/canceled/revoked/past_due)
- 빌링 API: /api/billing (GET 현재 플랜, POST 체크아웃/권한 확인)
- 요금제 페이지: /pricing (공개, 3개 플랜 카드, Pro "가장 인기" 배지)
- 랜딩 페이지: / (히어로, 6개 기능 카드, CTA, 푸터)
- 결제 성공/취소 페이지: /billing/success, /billing/cancel
- 미들웨어: /api/webhooks 인증 바이패스 추가

## [0.4.0] - 2026-05-06

### Added (Sprint 4) — EVALUATOR PASS
- Dashboard 계약 목록: 만기 임박 계약에 "갱신 제안서 발송" 버튼
- DashboardContractCard: 계약 카드 컴포넌트 (상태 배지, 제안서 버튼)
- 제안서 발송 API: /api/proposals POST (임차인명/월세 자동 입력)
- 임차인 응답 API: /api/proposals/[token]/respond POST
- 제안서 발송 UI: ProposalForm (인상율 계산, 5% 상한 경고)
- 제안서 목록 UI: ProposalListPage (발송 내역, 상태 표시)
- 커뮤니케이션 이력 UI: CommunicationHistory (발송/열람/응답 추적)
- 임차인 응답 페이지: /renew/[token] (수락/거절/협의요청)
- 상태 전이: negotiating → renewed (수락), move_out_pending (거절)
- 대시보드 실시간 반영: 제안서 발송 후 리스트 새로고침

## [0.3.0] - 2026-05-06

### Added (Sprint 2)
- OCR 파이프라인: 타입 정의 + mock OCR 서비스 (PaddleOCR 교체 가능 구조)
- 계약서 업로드 UI: 드래그앤드롭, 파일 타입/크기 검증, 미리보기
- OCR 리뷰 폼: 필드별 신뢰도 표시, 수동 수정, 특약 메모
- 계약 등록 API: /api/ocr (이미지→OCR), /api/contracts (계약 생성)
- Property CRUD repo: getPropertiesByLandlord, getPropertyById, createProperty
- 계약 등록 서비스: OCR 신뢰도 < 80% → draft + requires_review
- 계약 등록 페이지: /contracts/new

## [0.2.0] - 2026-05-05

### Changed (PRD v3.0)
- OCR 파이프라인: Claude API → PaddleOCR + PP-Structure + Regex + Qwen2.5
- 계약 상태: 5단계 → 9단계 기계 (draft/active/expiring_90/expiring_30/negotiating/renewed/move_out_pending/vacant/archived)
- 알림 채널: 이메일 단일 → FCM + Kakao 알림톡 + Email 다채널
- contracts 테이블: ocr_confidence, parsing_confidence, requires_review 필드 추가
- communications 테이블 신규 (발송·열람·응답 이력 추적)
- notifications 채널: push|email → push|email|kakao
- cn() 유틸리티: src/ui/lib → src/config (레이어 의존성 위반 수정)
- 대시보드 서비스: v3.0 상태 기반 집계로 리팩토링
- 전체 스펙·아키텍처·스프린트 문서 v3.0 동기화

## [0.1.0] - 2026-05-05

### Added
- PHASE 0 BOOTSTRAP: Next.js 16 + TypeScript + Tailwind v4 프로젝트 초기화
- Harness 인프라: 레이어 린터, 디렉토리 구조
- PHASE 1 PLANNER: 제품 스펙, 5개 Sprint 계획, 아키텍처 문서
