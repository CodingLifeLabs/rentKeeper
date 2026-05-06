# Sprint 2: 계약 등록 + OCR 파이프라인

## 구현 범위
- 계약서 사진 업로드 UI
- Redis 큐 기반 OCR 처리 (PaddleOCR + PP-Structure → Regex → Qwen2.5)
- OCR 신뢰도 계산 및 리뷰 플래그 (requires_review)
- 추출 정보 확인/수정 폼
- 계약 CRUD 저장 (draft → active 상태 전이)

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/`: OCR 추출 결과 타입, OCR 파이프라인 타입, 계약 등록 폼 타입
- [ ] `src/config/`: Redis 연결 설정
- [ ] `src/service/`: OCR 서비스 (PaddleOCR + Qwen2.5), 계약 등록 서비스
- [ ] `src/repo/`: 계약 CRUD, Supabase Storage 업로드
- [ ] `src/runtime/`: /api/ocr 엔드포인트 (큐 적재), /api/ocr/[jobId] (결과 조회)
- [ ] `src/ui/`: 계약서 업로드 페이지, OCR 결과 확인 폼 (신뢰도 표시, 리뷰 경고)
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] URL: /contracts/new → 계약 등록 페이지
- [ ] 렌더링: 업로드 영역 (드래그앤드롭 + 클릭)
- [ ] 인터랙션: 이미지 업로드 → 로딩 스피너 → OCR 결과 표시
- [ ] 렌더링: 추출 필드 (임차인명, 보증금, 월세, 만기일, 특약)
- [ ] 렌더링: OCR 신뢰도 표시 (높음/중간/낮음), 낮을 때 경고 배지
- [ ] 인터랙션: 필드 수정 → 저장 → 대시보드에 새 계약 카드 표시
- [ ] 상태 전이: 저장 시 draft → active 전이 동작
- [ ] 엣지 케이스: 빈 이미지, 지원하지 않는 포맷 시 에러 메시지
- [ ] 통과 기준: "업로드→OCR→신뢰도확인→수정→저장 전체 플로우 정상 동작"

## 의존 Sprint
이전 Sprint: Sprint 1
