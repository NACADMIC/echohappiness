# Git Push → 자동 배포 가이드

## 방법 1: Vercel 연결 (가장 간단, 추천)

Git push 할 때마다 자동 배포됩니다.

### 1단계: GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/내아이디/donation.git
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 연결

1. [vercel.com](https://vercel.com) 로그인
2. **Add New** → **Project**
3. **Import** → GitHub 저장소 `donation` 선택
4. **Environment Variables**에 `.env.example` 내용 입력 (모든 변수)
5. **Deploy** 클릭

### 3단계: 완료

이후 `git push` 할 때마다 자동 배포됩니다.

---

## 방법 2: GitHub Actions + Vercel CLI

Repository **Settings** → **Secrets and variables** → **Actions**에 추가:

| Secret 이름 | 설명 |
|------------|------|
| VERCEL_TOKEN | [vercel.com/account/tokens](https://vercel.com/account/tokens)에서 발급 |
| VERCEL_ORG_ID | Vercel 프로젝트 1회 배포 후 `.vercel/project.json`에서 확인 |
| VERCEL_PROJECT_ID | 위와 동일 |
| 나머지 환경변수 | Supabase, 카카오페이, ADMIN_PASSWORD 등 |

`.github/workflows/deploy.yml`이 push 시 자동 실행됩니다.
