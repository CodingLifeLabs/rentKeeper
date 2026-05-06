# Changelog

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
