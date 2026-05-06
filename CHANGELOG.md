# Changelog

## [0.4.0] - 2026-05-06

### Added (Sprint 4)
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
