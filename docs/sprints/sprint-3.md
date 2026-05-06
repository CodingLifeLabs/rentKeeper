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
- [ ] `src/types/`: 상태 전이 타입, 알림 설정 타입
- [ ] `src/service/`: 상태 기계 서비스, 알림 서비스 (FCM/Kakao/Resend), 월세 계산기 로직
- [ ] `src/repo/`: 알림 기록 CRUD, communications CRUD
- [ ] `src/runtime/`: Edge Function (만기 체크 cron, 상태 전이), /api/notify
- [ ] `src/ui/`: 알림 설정 페이지, 월세 계산기 컴포넌트, 커뮤니케이션 이력 패널
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] 대시보드: 상태별 배지 표시 (expiring_90=노랑, expiring_30=빨강, vacant=회색)
- [ ] 상태 전이: 만기 D-90 도달 시 active → expiring_90 자동 전이
- [ ] /calculator: 월세 입력 → 5% 상한 자동 계산 결과 표시
- [ ] /calculator: 법 조항 링크 (주택임대차보호법 제7조) 표시
- [ ] /settings/notifications: 채널별(FCM/Kakao/Email) 알림 ON/OFF 토글 동작
- [ ] 통과 기준: "상태 전이 + 만기 표시 + 계산기 + 알림 설정 전체 동작"

## 의존 Sprint
이전 Sprint: Sprint 2
