# Sprint 6: 계약 데이터 내보내기 (CSV / Excel / ZIP)

## 구현 범위
- CSV 내보내기 (전체/필터, UTF-8 BOM, 전화번호 마스킹)
- Excel (.xlsx) 내보내기 (4시트, 조건부 서식, 합계행)
- 계약서 원본 ZIP 일괄 다운로드 (Signed URL, 10분 만료)
- export_logs 테이블 및 이력 저장
- 내보내기 UI (대시보드/계약관리 페이지에 버튼 배치)

## Sprint Contract

### GENERATOR가 완료해야 할 것
- [ ] `src/types/`: ExportLog 타입, ExportType enum
- [ ] `src/config/`: exceljs 의존성 추가
- [ ] `src/repo/`: export-log CRUD (create, getByLandlord)
- [ ] `src/service/`: csv-export, xlsx-export, zip-export 서비스
- [ ] `src/runtime/`: /api/export/csv, /api/export/xlsx, /api/export/zip
- [ ] `src/ui/`: 내보내기 드롭다운 버튼 (계약관리 페이지에 배치)
- [ ] DB 마이그레이션: export_logs 테이블 생성 SQL
- [ ] Gate 1~5 통과

### EVALUATOR가 검증할 것
- [ ] /contracts: 내보내기 드롭다운 버튼 표시
- [ ] CSV 내보내기: 파일 다운로드, UTF-8 BOM, 전화번호 마스킹
- [ ] Excel 내보내기: 4시트 구조, 헤더 정상
- [ ] ZIP 내보내기: 파일 다운로드 (모킹 또는 실제)
- [ ] export_logs: 내보내기 후 이력 기록 확인
- [ ] 플랜별 접근 제어: Free=CSV만, Pro=CSV+Excel, Business=전체
- [ ] 통과 기준: "CSV/Excel/ZIP 내보내기 + 이력 저장 + 플랜 제한 전체 동작"

## 의존 Sprint
이전 Sprint: Sprint 5

## GENERATOR 자가 검증 결과
실행 일시: 2026-05-08T08:30:00Z

| Gate | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 레이어 의존성 | ✅ PASS | 위반 0건 |
| 2 | 타입 안전성   | ✅ PASS | 오류 0건 |
| 3 | ESLint        | ✅ PASS | error 0건 |
| 4 | 테스트 커버리지 | ✅ PASS | 20 tests passed |
| 5 | 빌드 성공     | ✅ PASS | - |
