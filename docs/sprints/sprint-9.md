# Sprint 9: 이메일 알림 (Resend) + 커뮤니케이션 이력 UI

## 구현 범위
- Resend 이메일 발송 실연동 (mock → 실제)
- 만기 알림 이메일 발송 (D-90/D-60/D-30/D-7)
- 커뮤니케이션 이력 UI 페이지
- 알림 발송 시 communications 테이블 기록

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/communication.ts`: Communication 타입 확인/보완
- [ ] `src/config/resend.ts`: Resend 클라이언트 설정
- [ ] `src/service/email.ts`: 이메일 발송 서비스 (Resend SDK)
- [ ] `src/service/notification.ts`: mock → 실제 이메일 발송 전환
- [ ] `src/service/`: 커뮤니케이션 이력 기록 (발송 시 communications INSERT)
- [ ] `src/runtime/`: /api/communications UI 연동
- [ ] `src/ui/`: 커뮤니케이션 이력 컴포넌트 (계약 상세 + 독립 페이지)
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] /dashboard: 만기 임박 계약 알림 발송 버튼 동작
- [ ] 이메일 발송 → communications 테이블에 기록 확인
- [ ] /contracts/[id]: 커뮤니케이션 이력 탭 정상 표시
- [ ] 이메일 템플릿: 만기일, 임차인명, 계약정보 포함
- [ ] /settings: 알림 채널 설정에 이메일 on/off 표시
- [ ] 통과 기준: "만기 알림 이메일 발송 + 이력 추적 전체 동작"

## 의존 Sprint
이전 Sprint: Sprint 8

## GENERATOR 자가 검증 결과
실행 일시: 2026-05-08T09:30:00Z

| Gate | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 레이어 의존성 | ✅ PASS | 위반 0건 |
| 2 | 타입 안전성   | ✅ PASS | 오류 0건 |
| 3 | ESLint        | ✅ PASS | error 0건 |
| 4 | 테스트 커버리지 | ✅ PASS | 48 tests passed |
| 5 | 빌드 성공     | ✅ PASS | - |
