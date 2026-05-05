# Sprint 5: 결제 (Polar) + 프로덕션 준비

## 구현 범위
- Polar 결제 연동 (Free/Pro/Business 플랜)
- 결제 웹훅 처리
- 플랜별 기능 제한 (계약 건수, OCR, 보관함 용량)
- 랜딩 페이지
- 프로덕션 배포 준비

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/`: Plan, Subscription 타입
- [ ] `src/config/`: Polar 설정
- [ ] `src/service/`: 결제 서비스, 플랜 제한 체크
- [ ] `src/runtime/`: /api/webhooks/polar, /api/billing
- [ ] `src/ui/`: 가격 페이지, 결제 성공/실패, 랜딩 페이지
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] /pricing: 3개 플랜 카드 표시 (Free/₩9,900/₩24,900)
- [ ] CTA 클릭 → Polar 결제 페이지 리다이렉트
- [ ] 결제 완료 → Pro 기능 잠금 해제
- [ ] Free 플랜: 계약 3건 제한 초과 시 업그레이드 유도 메시지
- [ ] / (랜딩): 히어로 + 기능 소개 + 가격 + CTA
- [ ] 통과 기준: "랜딩→가입→결제→기능사용 전체 플로우"

## 의존 Sprint
이전 Sprint: Sprint 4
