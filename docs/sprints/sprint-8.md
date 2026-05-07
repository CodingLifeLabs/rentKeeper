# Sprint 8: 대시보드 "오늘 해야 할 일" 개선 + 감사 로그

## 구현 범위
- 대시보드 "Today 액션" 섹션 (갱신 연락 필요, 응답 없음 N일, 만기 임박)
- 감사 로그(audit_logs) 테이블 및 기록 서비스
- 열람·내보내기 이력 추적
- 대시보드 행동 중심 UX 개선

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/`: AuditLog 타입
- [ ] `src/repo/`: audit-log CRUD
- [ ] `src/service/`: audit-logging 서비스 (내보내기, 열람 이력 기록)
- [ ] `src/runtime/`: /api/audit 엔드포인트 (이력 조회)
- [ ] `src/ui/`: 대시보드 "Today 액션" 섹션 컴포넌트
- [ ] `src/ui/`: 감사 로그 설정 페이지
- [ ] DB 마이그레이션: audit_logs 테이블 SQL
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] 대시보드: "오늘 해야 할 일" 섹션 정상 표시
- [ ] Today 액션: 만기 임박, 응답 없음 N일, 갱신 연락 필요 항목
- [ ] 내보내기 후 audit_logs에 이력 기록
- [ ] 제안서 열람 시 audit_logs에 이력 기록
- [ ] /settings: 감사 로그 이력 확인 가능
- [ ] 통과 기준: "Today 액션 + 감사 로그 기록 전체 동작"

## 의존 Sprint
이전 Sprint: Sprint 7
