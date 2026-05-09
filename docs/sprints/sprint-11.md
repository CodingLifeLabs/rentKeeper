# Sprint 11: 버그 수정 + 특약 템플릿

## 구현 범위

### 버그 수정
- `src/app/api/cron/expiry-check/route.ts`: `POST` → `GET` 핸들러 변경  
  (Vercel cron은 GET으로 호출하는데 현재 POST만 export)

### 특약 템플릿 (Special Clause Templates)
한국 임대차 계약서 작성 시 자주 사용되는 특약사항 템플릿 라이브러리.  
계약 등록/수정 화면에서 손쉽게 삽입 가능.

- `src/config/clause-templates.ts`: 특약 템플릿 정적 데이터 (8개 카테고리, 40+ 항목)
- `src/ui/components/contracts/clause-template-picker.tsx`: 템플릿 선택 모달
- `src/app/(protected)/contracts/new/page.tsx`: 특약 입력 필드에 템플릿 버튼 추가
- `src/app/(protected)/contracts/[id]/page.tsx`: 수정 탭에 템플릿 버튼 추가

### SQL 마이그레이션 (Supabase 적용)
- `sql/sprint_b_migrations.sql` → Supabase SQL Editor 실행
- `sql/sprint_c_migrations.sql` → Supabase SQL Editor 실행

---

## Sprint Contract

### GENERATOR가 완료해야 할 것

- [ ] `src/app/api/cron/expiry-check/route.ts`: GET 핸들러로 변경
- [ ] `src/config/clause-templates.ts`: 8개 카테고리 템플릿 정의
- [ ] `src/types/clause-template.ts`: ClauseTemplate, ClauseCategory 타입
- [ ] `src/ui/components/contracts/clause-template-picker.tsx`: 모달 UI
- [ ] 계약 등록 페이지 (`/contracts/new`) 특약란에 "템플릿 선택" 버튼 연결
- [ ] 계약 상세 수정 탭에 템플릿 버튼 연결
- [ ] Gate 1: 레이어 린터 통과
- [ ] Gate 2: tsc --noEmit 통과
- [ ] Gate 3: ESLint 통과
- [ ] Gate 4: Jest 커버리지 ≥ 80%
- [ ] Gate 5: npm run build 통과

### EVALUATOR가 검증할 것

- [ ] URL: localhost:3000/contracts/new → "템플릿 선택" 버튼 표시
- [ ] 버튼 클릭 → 모달 열림, 카테고리 목록 표시
- [ ] 카테고리 선택 → 해당 조항 목록 표시
- [ ] 조항 클릭 → 특약 입력란에 텍스트 삽입
- [ ] 모달 닫기 → 정상 닫힘
- [ ] `/api/cron/expiry-check` GET 요청 → 200 응답

## 의존 Sprint
이전 Sprint: Sprint B/C/D (완료)
