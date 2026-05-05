# Architecture: RentKeeper

## 레이어 구조

```
Types → Config → Repo → Service → Runtime → UI
```

| 레이어 | 역할 | 예시 |
|--------|------|------|
| Types | 순수 타입·인터페이스·enum | `Contract`, `Property`, `RenewalProposal` |
| Config | 환경변수·상수·클라이언트 | Supabase 클라이언트, Polar 설정 |
| Repo | DB/API 접근, 데이터 변환 | `getContracts()`, `createContract()` |
| Service | 비즈니스 로직, 유스케이스 | OCR 처리, 알림 발송, 계산기 |
| Runtime | 오케스트레이션·미들웨어 | Next.js API Routes, 미들웨어 |
| UI | 컴포넌트·페이지 | React 컴포넌트, 페이지 |

## 의존성 규칙
- **단방향**: 위에서 아래로만 import 가능
- **역방향 금지**: `repo` → `service` 불가, `ui` → `repo` 불가
- `.harness/linters/dependency-direction.js`가 위반 시 CI 차단

## 도메인 모델
```
Landlord 1──N Property 1──N Contract 1──N Notification
                                └──N RenewalProposal
```

## 외부 서비스 연동
- **Supabase**: DB, Auth, Storage, Edge Functions
- **Claude API**: OCR (계약서 이미지 → JSON)
- **Resend**: 이메일 발송
- **Polar**: 결제/구독 관리

## 인증 흐름
1. Supabase Auth (소셜: Google, Kakao)
2. 미들웨어에서 세션 체크
3. RLS로 임대인별 데이터 격리
