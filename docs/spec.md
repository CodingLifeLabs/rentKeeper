# Product Spec: RentKeeper (렌트키퍼) v3.0

## 목적
1~20실 규모 소규모 임대인의 계약 수명주기(등록→만기알림→갱신협상)를 자동화하여 공실 손실과 법적 리스크를 줄이는 SaaS.

## PMF 필터 통과 여부
- [x] 리텐션 임팩트: 만기 알림이 없으면 임대인이 핵심 타이밍을 놓쳐 이탈 가능 → 필수 기능
- [x] 습관 형성: 매월 월세 체크, 분기별 만기 확인 등 반복 사용(second-bite) 구조
- [x] Agentic 결과물: OCR로 계약서 자동 추출, 만기 알림 자동 발송, 갱신 제안서 자동 생성
→ 3/3 통과. 구현 진행.

## 기술 스택
- Frontend: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- AI/OCR: PaddleOCR + PP-Structure → Regex → Qwen2.5 (구조화)
- Queue: Redis (OCR 처리 큐)
- Notification: FCM (푸시) + Kakao 알림톡 + Resend (이메일)
- Billing: Polar
- Deploy: Vercel

## 아키텍처 레이어
```
Types → Config → Repo → Service → Runtime → UI
```

## DB 스키마
### landlords
- id (uuid PK)
- user_id (FK → auth.users)
- name, phone
- created_at

### properties
- id (uuid PK)
- landlord_id (FK → landlords)
- address, unit_number
- type (원룸|오피스텔|다가구)
- area_sqm

### contracts
- id (uuid PK)
- property_id (FK → properties)
- tenant_name, tenant_phone
- deposit, monthly_rent
- start_date, end_date
- contract_type (월세|전세)
- status (draft|active|expiring_90|expiring_30|negotiating|renewed|move_out_pending|vacant|archived)
- original_file_url
- extracted_data (jsonb)
- ocr_confidence (numeric)
- parsing_confidence (numeric)
- requires_review (boolean)
- notes

### renewal_proposals
- id (uuid PK)
- contract_id (FK → contracts)
- proposed_rent, proposed_deposit
- message
- share_token (nanoid 21)
- status (sent|accepted|negotiating|rejected)
- sent_at, responded_at

### communications (v3.0 신규)
- id (uuid PK)
- contract_id (FK → contracts)
- type (renewal|notice)
- channel (email|kakao)
- message
- opened_at, responded_at
- created_at

### notifications
- id (uuid PK)
- contract_id (FK → contracts)
- type (d90|d60|d30|d7)
- sent_at
- channel (push|email|kakao)

## 계약 상태 기계 (v3.0)
```
draft → active → expiring_90 → expiring_30 → negotiating → renewed → active
                                        └→ move_out_pending → vacant → archived
```

## 화면·기능 목록 (v3.0 MVP)
1. 인증: 소셜 로그인 (카카오, 구글)
2. 계약 대시보드: 전체 세대 현황 (계약 중/만기 임박/공실/협상 중)
3. 계약 등록: 계약서 사진 업로드 → PaddleOCR + Qwen2.5 OCR → 신뢰도 표시 → 수동 수정 → 저장
4. 만기 알림: D-90/D-60/D-30/D-7 푸시(FCM) + 카카오 알림톡 + 이메일
5. 월세 인상 계산기: 5% 상한 자동 계산 + 법 조항 표시
6. 갱신 제안서: PDF 생성 → 임차인 링크 발송 → 수락/거절 응답
7. 커뮤니케이션 이력: 이메일·카카오 발송 기록, 열람·응답 추적
8. 계약서 보관함: Supabase Storage 암호화 저장

## 비기능 요구사항
- 성능: 대시보드 초기 로드 2초 이내
- 접근성: WCAG 2.1 AA
- 보안: RLS로 임대인별 데이터 격리, 계약서 Private Bucket
- OCR 정확도: ≥ 85%
- OCR 신뢰도: 신뢰도 < 80% 시 사용자 검토 필수 (requires_review = true)

## 제외 범위 (v3.0 Scope Out)
- 공인중개사용 대시보드
- 20실 이상 대형 임대법인
- 상가 임대인
- 임대소득 세금 신고 연동 (Phase 3)
- 공실 부동산 자동 공유 (Phase 3)

## 디자인 시스템
- Primary: #1A3C5E (딥 네이비)
- Accent: #00C896 (에메랄드)
- Warning: #FF8C00
- Danger: #FF4D4D
- Background: #F7F9FC
