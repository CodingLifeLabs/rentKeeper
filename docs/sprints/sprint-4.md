# Sprint 4: 갱신 제안서 + 임차인 응답

## 구현 범위
- 갱신 제안서 생성 (임차인 정보 자동 입력)
- nanoid 공유 토큰 링크 발송
- 임차인 응답 페이지 (수락/거절/협의요청)
- 임대인 대시보드 응답 상태 표시

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/`: RenewalProposal 타입
- [ ] `src/service/`: 제안서 생성 서비스, 이메일 발송
- [ ] `src/repo/`: renewal_proposals CRUD
- [ ] `src/runtime/`: /api/proposals 엔드포인트, /api/proposals/[token]/respond
- [ ] `src/ui/`: 제안서 생성 폼, 임차인 응답 페이지 (/renew/[token])
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] 대시보드: 만기 임박 계약에 "갱신 제안서 발송" 버튼
- [ ] 제안서 폼: 임차인명·현재월세 자동 입력, 인상률 선택
- [ ] 발송 후: 대시보드에 "발송 완료 - 대기 중" 상태 표시
- [ ] 임차인 링크 접속: 제안서 내용 표시 + 수락/거절/협의요청 버튼
- [ ] 임차인 응답: 대시보드에 실시간 반영
- [ ] 통과 기준: "발송→임차인 확인→응답→대시보드 반영 전체 E2E"

## 의존 Sprint
이전 Sprint: Sprint 3
