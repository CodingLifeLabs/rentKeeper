# Sprint 10: 계약 상세 페이지 + 계약서 보관함

## 구현 범위
- 계약 상세 페이지 (/contracts/[id])
- 계약서 보관함 (Supabase Storage 업로드/다운로드)
- 상세 페이지에 커뮤니케이션 이력 탭 통합
- 계약 정보 수정 기능

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/`: StorageFile 타입 정의
- [ ] `src/config/`: Supabase Storage 버킷 설정
- [ ] `src/repo/`: Storage 파일 CRUD (upload/download/list/delete)
- [ ] `src/repo/`: 계약 상세 조회 (getContractById)
- [ ] `src/service/`: 계약서 보관 서비스 (업로드, 목록, 삭제)
- [ ] `src/service/`: 계약 수정 서비스
- [ ] `src/runtime/`: /api/contracts/[id] GET/PUT/PATCH
- [ ] `src/runtime/`: /api/contracts/[id]/files POST/GET/DELETE
- [ ] `src/ui/`: 계약 상세 페이지 (정보 + 보관함 + 커뮤니케이션 탭)
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] /contracts/[id]: 계약 기본 정보 표시 (임차인, 기간, 월세, 상태)
- [ ] /contracts/[id]: 커뮤니케이션 이력 탭 표시 (CommunicationList 연동)
- [ ] /contracts/[id]: 계약서 파일 업로드 (드래그앤드롭)
- [ ] /contracts/[id]: 업로드된 파일 목록 + 다운로드
- [ ] /contracts/[id]: 계약 정보 수정 (월세, 메모 등)
- [ ] Supabase Storage: Private Bucket + RLS로 임대인별 격리
- [ ] 통과 기준: "계약 상세 + 보관함 + 이력 탭 전체 동작"

## 의존 Sprint
이전 Sprint: Sprint 9

## GENERATOR 자가 검증 결과
실행 일시: 2026-05-08

| Gate | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 레이어 의존성 | ✅ PASS | 위반 0건 |
| 2 | 타입 안전성 | ✅ PASS | 오류 0건 |
| 3 | ESLint | ✅ PASS | error 0건 |
| 4 | 테스트 | ✅ PASS | 48 pass / 0 fail |
| 5 | 빌드 성공 | ✅ PASS | - |
