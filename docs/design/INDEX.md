# Design Decisions (ADR Index)

## Active Decisions

| ID | 제목 | 상태 | 날짜 |
|----|------|------|------|
| ADR-001 | Next.js 16 App Router + Supabase 아키텍처 | Accepted | 2026-05-05 |
| ADR-002 | Claude Vision API로 계약서 OCR | Accepted | 2026-05-05 |
| ADR-003 | Resend로 이메일 알림 발송 | Accepted | 2026-05-05 |
| ADR-004 | Polar로 구독 결제 | Accepted | 2026-05-05 |
| ADR-005 | nanoid 기반 공유 토큰 (갱신 제안서) | Accepted | 2026-05-05 |

## ADR-001: Next.js 16 App Router + Supabase
- RSC로 대시보드 초기 로드 최적화
- Supabase RLS로 멀티테넌시 데이터 격리
- Edge Functions로 알림 cron 작업

## ADR-002: Claude Vision API
- 한국어 계약서 인식 정확도 우수
- JSON 구조화 출력 지원
- 대안 (Google Vision, Tesseract) 대비 필드 추출 품질 우위

## ADR-003: Resend
- 개발자 친화적 API
- Next.js 네이티브 지원
- 이메일 템플릿 관리 용이

## ADR-004: Polar
- 글로벌 SaaS 결제 지원
- 웹훅 통합 용이
- Stripe 대비 설정 간소화

## ADR-005: nanoid 공유 토큰
- URL-safe, 21자리
- 충돌 확률 무시 가능
- 임차인이 인증 없이 제안서 확인 가능
