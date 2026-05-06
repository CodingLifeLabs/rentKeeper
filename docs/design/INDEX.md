# Design Decisions (ADR Index) — v3.0

## Active Decisions

| ID | 제목 | 상태 | 날짜 |
|----|------|------|------|
| ADR-001 | Next.js 16 App Router + Supabase 아키텍처 | Accepted | 2026-05-05 |
| ADR-002 | PaddleOCR + Qwen2.5 온프레미스 OCR | Accepted | 2026-05-05 |
| ADR-003 | FCM + Kakao 알림톡 + Resend 다채널 알림 | Accepted | 2026-05-05 |
| ADR-004 | Redis 기반 OCR 처리 큐 | Accepted | 2026-05-05 |
| ADR-005 | Polar로 구독 결제 | Accepted | 2026-05-05 |
| ADR-006 | 9단계 계약 상태 기계 | Accepted | 2026-05-05 |
| ADR-007 | nanoid 기반 공유 토큰 (갱신 제안서) | Accepted | 2026-05-05 |

## ADR-001: Next.js 16 App Router + Supabase
- RSC로 대시보드 초기 로드 최적화
- Supabase RLS로 멀티테넌시 데이터 격리
- Edge Functions로 알림 cron 작업

## ADR-002: PaddleOCR + Qwen2.5 (v3.0 변경)
- **변경 사유**: Claude API → 온프레미스 OCR로 전환하여 비용·지연 감소
- PaddleOCR: 한국어 텍스트 인식 정확도 우수, 오픈소스
- PP-Structure: 표·양식 구조화
- Regex: 핵심 필드 후보 추출 (임차인, 보증금, 월세, 기간)
- Qwen2.5: 최종 JSON 구조화, 특약사항 해석
- 신뢰도 기반 리뷰 플래그 (confidence < 80% → requires_review)

## ADR-003: FCM + Kakao 알림톡 + Resend (v3.0 변경)
- **변경 사유**: v1 이메일 단일 채널 → 3채널 다중 알림
- FCM: 푸시 알림 (모바일·웹)
- Kakao 알림톡: 한국 임대인 주 사용 채널
- Resend: 이메일 (기록용)
- communications 테이블로 발송·열람·응답 이력 추적

## ADR-004: Redis OCR 큐 (v3.0 신규)
- 이미지 OCR 처리는 비동기 큐로 분리
- Redis Queue로 작업 순서 보장
- 실패 시 재시도 (최대 3회)

## ADR-005: Polar
- 글로벌 SaaS 결제 지원
- 웹훅 통합 용이
- Stripe 대비 설정 간소화

## ADR-006: 9단계 계약 상태 기계 (v3.0 신규)
- draft → active → expiring_90 → expiring_30 → negotiating → renewed → move_out_pending → vacant → archived
- 자동 전이: Edge Function cron이 만료일 기반 상태 갱신
- 수동 전이: 임대인이 직접 상태 변경 (예: 퇴거 처리)

## ADR-007: nanoid 공유 토큰
- URL-safe, 21자리
- 충돌 확률 무시 가능
- 임차인이 인증 없이 제안서 확인 가능
