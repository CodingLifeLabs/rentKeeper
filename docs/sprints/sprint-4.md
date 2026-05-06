# Sprint 4: 갱신 제안서 + 커뮤니케이션 + 임차인 응답

## 구현 범위
- 갱신 제안서 생성 (임차인 정보 자동 입력)
- nanoid 공유 토큰 링크 발송
- 임차인 응답 페이지 (수락/거절/협의요청)
- 임대인 대시보드 응답 상태 표시
- 커뮤니케이션 이력 (발송·열람·응답 추적)
- 상태 전이: negotiating → renewed / move_out_pending

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [x] `src/types/`: RenewalProposal 타입, ProposalStatus, TenantResponse
- [x] `src/repo/`: renewal_proposals CRUD
- [x] `src/service/`: 제안서 생성 서비스, 공유 토큰(nanoid), 상태 전이
- [x] `src/runtime/`: /api/proposals, /api/proposals/[token], /api/proposals/[token]/respond, /api/communications
- [x] `src/ui/`: 제안서 생성 폼, 임차인 응답 페이지 (/renew/[token]), 커뮤니케이션 이력 패널, 갱신제안서 관리 페이지
- [x] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [x] 대시보드 또는 갱신제안서 페이지: 만기 임박 계약 목록
- [x] 제안서 폼: 임차인명·현재월세 자동 입력, 인상률 표시
- [x] 발송 후: 상태 negotiating 전이, 커뮤니케이션 이력 표시
- [x] 임차인 링크 접속: 제안서 내용 표시 + 수락/거절/협의요청 버튼
- [x] 임차인 응답: 상태 renewed 또는 move_out_pending 전이
- [x] 통과 기준: "발송→임차인 확인→응답→대시보드 반영 전체 E2E"

## 의존 Sprint
이전 Sprint: Sprint 3

## GENERATOR 자가 검증 결과
실행 일시: 2026-05-06

| Gate | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 레이어 의존성 | ✅ PASS | 위반 0건 |
| 2 | 타입 안전성 | ✅ PASS | 오류 0건 |
| 3 | ESLint | ✅ PASS | error 0건 (warnings only) |
| 4 | 테스트 커버리지 | ✅ PASS | 94.73% (95 tests, 14 suites) |
| 5 | 빌드 성공 | ✅ PASS | Next.js 16 build 성공 |
