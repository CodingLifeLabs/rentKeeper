# Sprint 2: 계약 등록 + AI OCR

## 구현 범위
- 계약서 사진 업로드 UI
- Claude Vision API 연동 (계약서 → 구조화 데이터)
- 추출 정보 확인/수정 폼
- 계약 CRUD 저장

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/`: OCR 추출 결과 타입, 계약 등록 폼 타입
- [ ] `src/service/`: Claude OCR 서비스, 계약 등록 서비스
- [ ] `src/repo/`: 계약 CRUD, Supabase Storage 업로드
- [ ] `src/runtime/`: /api/ocr 엔드포인트 (Claude Vision 호출)
- [ ] `src/ui/`: 계약서 업로드 페이지, 추출 결과 확인 폼
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] URL: /contracts/new → 계약 등록 페이지
- [ ] 렌더링: 업로드 영역 (드래그앤드롭 + 클릭)
- [ ] 인터랙션: 이미지 업로드 → 로딩 스피너 → OCR 결과 표시
- [ ] 렌더링: 추출 필드 (임차인명, 보증금, 월세, 만기일, 특약)
- [ ] 인터랙션: 필드 수정 → 저장 → 대시보드에 새 계약 카드 표시
- [ ] 엣지 케이스: 빈 이미지, 지원하지 않는 포맷 시 에러 메시지
- [ ] 통과 기준: "업로드→OCR→수정→저장 전체 플로우 정상 동작"

## 의존 Sprint
이전 Sprint: Sprint 1
