# 줌 강의 기부금 결제 및 영수증 관리 시스템

무통장입금과 카카오페이를 지원하는 사단법인 강의 기부금 결제 시스템입니다.

## 주요 기능

- **랜딩 페이지**: 강의 정보, 금액 입력, 결제 방식 선택(무통장/카카오페이), 기부자 정보, 영수증 필요 여부
- **무통장입금**: 입금 계좌 안내, 입금자명 형식, 관리자 입금 확인, 확인 이메일 발송
- **카카오페이**: 단건결제 API 연동, 결제 완료 이메일
- **관리자 대시보드**: 결제 내역, 필터링, CSV 다운로드, 입금 확인, 통계
- **영수증 발급**: PDF 생성, 개별/일괄 발급, 이메일 발송

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- 카카오페이 API
- pdf-lib (PDF)
- Resend (이메일)

---

## 카카오페이 API 키 발급 방법

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 또는 선택
3. **카카오페이** 메뉴에서 **개발자 등록** 신청
4. 등록 완료 후 **카카오페이** → **발급된 키**에서 확인
   - `cid`: 가맹점 코드 (테스트: `TC0ONETIME`)
   - `Secret Key`: `.env`의 `KAKAOPAY_SECRET`에 설정

> 테스트 결제는 카카오페이 개발자 등록 후 테스트 키로 가능합니다.

---

## Supabase 프로젝트 설정

### 1. 프로젝트 생성

1. [Supabase](https://supabase.com) 로그인 후 **New Project** 생성
2. 프로젝트 생성 후 **Settings** → **API**에서 URL, anon key, service_role key 복사

### 2. 테이블 생성

Supabase 대시보드 → **SQL Editor**에서 `supabase/migrations/001_init.sql` 내용 실행:

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lecture_title TEXT NOT NULL,
  lecture_description TEXT,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'kakaopay')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  kakaopay_tid TEXT,
  kakaopay_order_id TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  receipt_required BOOLEAN DEFAULT FALSE,
  resident_number_encrypted TEXT,
  deposit_name_format TEXT,
  deposit_confirmed_at TIMESTAMPTZ,
  deposit_confirmed_by TEXT
);

CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_payment_method ON donations(payment_method);
CREATE INDEX idx_donations_receipt_required ON donations(receipt_required);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
```

### 3. RLS (Row Level Security)

기본적으로 service_role key는 RLS를 우회합니다. anon key로 접근하는 클라이언트가 있다면 RLS 정책을 설정하세요.

---

## 환경변수 설정

`.env.example`을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

`.env.local`에 실제 값 입력:

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `KAKAOPAY_CID` | 카카오페이 CID |
| `KAKAOPAY_SECRET` | 카카오페이 Secret Key |
| `BANK_NAME` | 입금 은행명 |
| `BANK_ACCOUNT` | 입금 계좌번호 |
| `ACCOUNT_HOLDER` | 예금주 |
| `ADMIN_PASSWORD` | 관리자 비밀번호 |
| `SESSION_SECRET` | 세션 암호화용 (32자 이상) |
| `ENCRYPTION_SECRET` | 주민번호 암호화용 (32자) |
| `RESEND_API_KEY` | Resend API 키 |
| `EMAIL_FROM` | 발신 이메일 |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (결제 콜백) |
| `ORG_NAME` | 단체명 |
| `ORG_UNIQUE_NUMBER` | 단체 고유번호 |

---

## 로컬 개발 환경 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

- **메인**: 기부금 결제 폼
- **관리자**: http://localhost:3000/admin

---

## 배포 가이드 (Vercel)

### 1. Vercel 배포

1. [Vercel](https://vercel.com) 로그인
2. **Import** → GitHub 저장소 연결
3. **Environment Variables**에 `.env.local` 내용 추가
4. **Deploy** 클릭

### 2. 환경변수 설정

Vercel 대시보드 → **Settings** → **Environment Variables**에서 위 환경변수 모두 입력

### 3. 호스트 설정

- `NEXT_PUBLIC_APP_URL` = `https://your-vercel-app.vercel.app`

### 4. 카카오페이 콜백 URL

카카오 개발자 콘솔에서 결제 승인/취소/실패 URL 등록:

- 승인: `https://your-domain.com/success/kakaopay`
- 취소: `https://your-domain.com/cancel`
- 실패: `https://your-domain.com/fail`

---

## 보안

- 관리자 페이지는 비밀번호 인증 (쿠키 기반 세션)
- 주민번호는 AES-256-GCM으로 암호화 저장
- 민감 정보는 환경변수로 관리
- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용 (절대 클라이언트 노출 금지)

---

## 라이선스

MIT
