# Sprint 3: 만기 알림 + 월세 계산기

## 구현 범위
- 만기 D-90/D-60/D-30/D-7 알림 (Supabase Edge Function + Resend)
- 알림 설정 페이지 (타이밍 커스텀, ON/OFF)
- 월세 인상 계산기 (5% 상한 자동 계산)
- 대시보드 만기 임박 표시 강화

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/service/`: 알림 서비스, 월세 계산기 로직
- [ ] `src/repo/`: 알림 기록 CRUD
- [ ] `src/runtime/`: Edge Function (만기 체크 cron), /api/notify
- [ ] `src/ui/`: 알림 설정 페이지, 월세 계산기 컴포넌트
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] 대시보드: 만기 임박 계약에 경고 배지 표시 (D-90 노란색, D-30 빨간색)
- [ ] /calculator: 월세 입력 → 5% 상한 자동 계산 결과 표시
- [ ] /calculator: 법 조항 링크 (주택임대차보호법 제7조) 표시
- [ ] /settings/notifications: 알림 타이밍 ON/OFF 토글 동작
- [ ] 통과 기준: "만기 표시 + 계산기 + 알림 설정 전체 동작"

## 의존 Sprint
이전 Sprint: Sprint 2
