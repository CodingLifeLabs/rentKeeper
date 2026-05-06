# Architecture: RentKeeper v3.0

## 레이어 구조

```
Types → Config → Repo → Service → Runtime → UI
```

| 레이어 | 역할 | 예시 |
|--------|------|------|
| Types | 순수 타입·인터페이스·enum | `Contract`, `Property`, `Communication` |
| Config | 환경변수·상수·클라이언트 | Supabase 클라이언트, FCM 설정 |
| Repo | DB/API 접근, 데이터 변환 | `getContracts()`, `createCommunication()` |
| Service | 비즈니스 로직, 유스케이스 | OCR 처리, 알림 발송, 상태 전이 |
| Runtime | 오케스트레이션·미들웨어 | Next.js API Routes, 미들웨어 |
| UI | 컴포넌트·페이지 | React 컴포넌트, 페이지 |

## 의존성 규칙
- **단방향**: 위에서 아래로만 import 가능
- **역방향 금지**: `repo` → `service` 불가, `ui` → `repo` 불가
- `.harness/linters/dependency-direction.js`가 위반 시 CI 차단

## 도메인 모델
```
Landlord 1──N Property 1──N Contract 1──N Notification
                                ├──N Communication
                                └──N RenewalProposal
```

## 계약 상태 기계
```
draft → active → expiring_90 → expiring_30 → negotiating → renewed → active
                                        └→ move_out_pending → vacant → archived
```

| 상태 | 의미 | 자동 전이 트리거 |
|------|------|------------------|
| draft | OCR 완료, 미검토 | 임대인 확인 → active |
| active | 계약 진행 중 | 만기 D-90 → expiring_90 |
| expiring_90 | 만기 90일 전 | D-30 → expiring_30 |
| expiring_30 | 만기 30일 전 | 갱신 협의 시작 → negotiating |
| negotiating | 갱신 협의 중 | 합의 → renewed |
| renewed | 갱신 완료 | 새 계약 start_date → active |
| move_out_pending | 퇴거 예정 | 퇴거 완료 → vacant |
| vacant | 공실 | 신규 계약 → active |
| archived | 보관 | 수동 전이만 |

## OCR 파이프라인 (v3.0)
```
계약서 이미지 → Redis Queue → PaddleOCR (텍스트 추출)
                                   ↓
                            PP-Structure (표 구조화)
                                   ↓
                            Regex (필드 후보 추출)
                                   ↓
                            Qwen2.5 (최종 구조화)
                                   ↓
                         ocr_confidence / parsing_confidence 계산
                                   ↓
                      confidence < 80% → requires_review = true
```

## 외부 서비스 연동
- **Supabase**: DB, Auth, Storage, Edge Functions, RLS
- **PaddleOCR + Qwen2.5**: 온프레미스 OCR (한국어 계약서 특화)
- **Redis**: OCR 처리 큐
- **FCM**: 푸시 알림
- **Kakao 알림톡**: 카카오 채널 알림
- **Resend**: 이메일 발송
- **Polar**: 결제/구독 관리

## 인증 흐름
1. Supabase Auth (소셜: Google, Kakao)
2. 미들웨어에서 세션 체크
3. RLS로 임대인별 데이터 격리

## 알림 채널 (v3.0)
| 채널 | 용도 | 우선순위 |
|------|------|----------|
| FCM Push | 즉시 알림 (D-7) | 1순위 |
| Kakao 알림톡 | 공식 알림 (D-30, D-90) | 2순위 |
| Email | 기록용 전체 알림 | 3순위 |
