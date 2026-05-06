# Sprint 2: 계약 등록 + OCR 파이프라인

## 구현 범위
- 계약서 사진 업로드 UI
- OCR 파이프라인 서비스 (mock 구현, PaddleOCR 교체 가능)
- OCR 신뢰도 계산 및 리뷰 플래그 (requires_review)
- 추출 정보 확인/수정 폼
- 계약 CRUD 저장 (draft → active 상태 전이)

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [x] `src/types/ocr.ts`: OcrField, OcrResult, OcrJobRequest, OcrJobResult, ContractFormData 타입
- [x] `src/repo/property.ts`: Property CRUD (getPropertiesByLandlord, getPropertyById, createProperty)
- [x] `src/service/ocr.ts`: OCR 서비스 (processOcr, requiresManualReview, extractOcrConfidences)
- [x] `src/service/contract-registration.ts`: 계약 등록 서비스 (registerContract)
- [x] `src/runtime/`: /api/ocr (이미지 업로드 → OCR), /api/contracts (계약 생성)
- [x] `src/ui/components/contracts/upload-dropzone.tsx`: 드래그앤드롭 업로드 UI
- [x] `src/ui/components/contracts/ocr-review-form.tsx`: OCR 결과 리뷰·수정 폼
- [x] `src/app/(protected)/contracts/new/page.tsx`: 계약 등록 페이지
- [x] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] URL: /contracts/new → 계약 등록 페이지
- [ ] 렌더링: 업로드 영역 (드래그앤드롭 + 클릭)
- [ ] 인터랙션: 이미지 업로드 → 로딩 스피너 → OCR 결과 표시
- [ ] 렌더링: 추출 필드 (임차인명, 보증금, 월세, 만기일, 특약)
- [ ] 렌더링: OCR 신뢰도 표시 (높음/중간/낮음), 낮을 때 경고 배지
- [ ] 인터랙션: 필드 수정 → 저장 → 대시보드에 새 계약 카드 표시
- [ ] 엣지 케이스: 빈 이미지, 지원하지 않는 포맷 시 에러 메시지
- [ ] 통과 기준: "업로드→OCR→신뢰도확인→수정→저장 전체 플로우 정상 동작"

## 의존 Sprint
이전 Sprint: Sprint 1

## GENERATOR 자가 검증 결과
실행 일시: 2026-05-06

| Gate | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 레이어 의존성 | ✅ PASS | 위반 0건 |
| 2 | 타입 안전성   | ✅ PASS | 오류 0건 |
| 3 | ESLint        | ✅ PASS | error 0건, warning 3건 |
| 4 | 테스트        | ✅ PASS | 17/17 통과 |
| 5 | 빌드 성공     | ✅ PASS | Next.js 16.2.4 빌드 성공 |
