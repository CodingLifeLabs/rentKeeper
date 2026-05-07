# Product Spec: RentKeeper v3.1 Delta

## v3.0 → v3.1 변경사항 요약

### 신규 기능
1. **F-05 계약 데이터 외부 저장** (CSV / Excel / ZIP)
2. **export_logs 테이블** — 내보내기 이력 추적
3. **감사 로그(audit_logs)** — 열람·내보내기 이력

### 개선 기능
4. **갱신 제안 3단계 플로우** — D-90 안부 → D-60 제안 → D-45 리마인드 → D-30 완료
5. **임차인 응답 페이지 UX 개선** — 비교 섹션, 혜택 문구, 3개 선택지
6. **컬러 시스템 업데이트** — v3.0 색상 → v3.1 PRD 기준

### 기존 구현 상태 (v3.0 완료)
- [x] Sprint 1: 인증, DB 스키마, 기본 UI
- [x] Sprint 2: OCR 파이프라인, 계약 등록
- [x] Sprint 3: 대시보드, 만기 알림, 계산기
- [x] Sprint 4: 갱신 제안서, 커뮤니케이션 이력, 임차인 응답
- [x] Sprint 5: Polar 결제, 랜딩 페이지, 요금제

## PMF 필터
- [x] 리텐션: 데이터 내보내기 → 플랫폼 의존성 탈피 → 이탈 장벽
- [x] 습관 형성: 갱신 3단계 플로우 → 더 많은 터치포인트
- [x] Agentic: 갱신 플로우 자동 진행, 내보내기 자동 처리
→ 3/3 통과

## 영향받는 레이어
- Types: ExportLog, AuditLog 타입 추가, 갱신 플로우 상태 추가
- Config: exceljs 의존성 추가
- Repo: export-log, audit-log CRUD
- Service: CSV/Excel/ZIP 생성 서비스, 갱신 플로우 자동화 서비스
- Runtime: /api/export/*, /api/audit/* 엔드포인트
- UI: 내보내기 버튼, 임차인 응답 페이지 개선, 갱신 플로우 UX

## 제외 범위
- 실제 PaddleOCR/Qwen2.5 연동 (로컬 추론 환경 필요)
- FCM 푸시 / Kakao 알림톡 실제 발송 (외부 API 키 필요)
- 세무 연동, 공실 관리 (Phase 3)
- 다중 사용자 (Phase 3)
