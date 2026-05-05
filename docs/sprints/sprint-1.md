# Sprint 1: 프로젝트 기반 + 인증 + 대시보드 뼈대

## 구현 범위
- Supabase 연결 + Auth 설정
- 인증 UI (로그인/회원가입)
- 대시보드 레이아웃 (사이드바 + 헤더 + 메인)
- 계약 대시보드 뼈대 (빈 상태 UI)
- DB 스키마 + RLS 정책

## Sprint Contract (GENERATOR ↔ EVALUATOR 합의)

### GENERATOR가 완료해야 할 것 (코드 구현 + 자가 검증)
- [ ] `src/types/`: Contract, Property, Landlord, Notification 타입 정의
- [ ] `src/config/`: Supabase 클라이언트 설정, 환경변수
- [ ] `src/repo/`: Supabase CRUD (contracts, properties, landlords)
- [ ] `src/service/`: 인증 서비스, 대시보드 데이터 집계
- [ ] `src/runtime/`: 미들웨어 (인증 가드)
- [ ] `src/ui/`: 로그인 페이지, 대시보드 페이지, 사이드바, 헤더
- [ ] Gate 1 통과: 레이어 린터 (위반 0건)
- [ ] Gate 2 통과: tsc --noEmit (오류 0건, any 없음)
- [ ] Gate 3 통과: ESLint (error 0건)
- [ ] Gate 4 통과: Jest 커버리지 80% 이상
- [ ] Gate 5 통과: npm run build 성공

### EVALUATOR가 검증할 것 (사용자 관점 동작)
- [ ] URL: localhost:3000 → 로그인 페이지 리다이렉트
- [ ] 렌더링: 로그인 폼 (이메일/소셜 로그인 버튼)
- [ ] 인터랙션: 로그인 성공 → 대시보드 이동
- [ ] 렌더링: 대시보드 헤더 (RentKeeper 로고, 사용자명, 로그아웃)
- [ ] 렌더링: 사이드바 (대시보드, 계약관리, 알림설정 메뉴)
- [ ] 렌더링: 빈 상태 ("아직 등록된 계약이 없습니다" + CTA)
- [ ] 인터랙션: 로그아웃 → 로그인 페이지로 리다이렉트
- [ ] 통과 기준: "위 항목 전체 정상 작동"

## 의존 Sprint
이전 Sprint: 없음 (첫 Sprint)

## GENERATOR 자가 검증 결과
실행 일시: 2026-05-05

| Gate | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 레이어 의존성 | ✅ PASS | 위반 0건 |
| 2 | 타입 안전성   | ✅ PASS | 오류 0건 |
| 3 | ESLint        | ✅ PASS | error 0건 |
| 4 | 테스트        | ✅ PASS | 6/6 통과 |
| 5 | 빌드 성공     | ✅ PASS | Next.js 16.2.4 빌드 성공 |
