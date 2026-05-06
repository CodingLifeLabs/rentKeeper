# Sprint 3: 만기 알림 + 상태 기계 + 월세 계산기

## 구현 범위
- 9단계 계약 상태 기계 자동 전이 (Edge Function cron)
- 만기 D-90/D-60/D-30/D-7 다채널 알림 (FCM + Kakao 알림톡 + Resend)
- 알림 설정 페이지 (채널별 ON/OFF, 타이밍 커스텀)
- communications 테이블 발송·열람 이력 기록
- 월세 인상 계산기 (5% 상한 자동 계산)
- 대시보드 만기 임박 표시 강화 (상태별 색상 배지)

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [x] `src/types/`: 상태 전이 타입, 알림 설정 타입
- [x] `src/service/`: 상태 기계 서비스, 알림 서비스 (FCM/Kakao/Resend), 월세 계산기 로직
- [x] `src/repo/`: 알림 기록 CRUD, communications CRUD
- [x] `src/runtime/`: Edge Function (만기 체크 cron, 상태 전이), /api/notify
- [x] `src/ui/`: 알림 설정 페이지, 월세 계산기 컴포넌트, 커뮤니케이션 이력 패널
- [x] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] 대시보드: 상태별 배지 표시 (expiring_90=노랑, expiring_30=빨강, vacant=회색)
- [ ] 상태 전이: 만기 D-90 도달 시 active → expiring_90 자동 전이
- [ ] /calculator: 월세 입력 → 5% 상한 자동 계산 결과 표시
- [ ] /calculator: 법 조항 링크 (주택임대차보호법 제7조) 표시
- [ ] /settings/notifications: 채널별(FCM/Kakao/Email) 알림 ON/OFF 토글 동작
- [ ] 통과 기준: "상태 전이 + 만기 표시 + 계산기 + 알림 설정 전체 동작"

## 의존 Sprint
이전 Sprint: Sprint 2

## GENERATOR 자가 검증 결과
실행 일시: 2026-05-06

| Gate | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 레이어 의존성 | ✅ PASS | 위반 0건 |
| 2 | 타입 안전성 | ✅ PASS | 오류 0건 |
| 3 | ESLint | ✅ PASS | error 0건, warning 2건 (supabase-server.ts 미커버) |
| 4 | 테스트 커버리지 | ✅ PASS | 94.9% (77 tests passed) |
| 5 | 빌드 성공 | ✅ PASS | 신규 라우트: /calculator, /notifications, /api/cron/expiry-check, /api/notify |
