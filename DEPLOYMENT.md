# 배포 가이드

이 문서는 주간 태그라인 투표 시스템을 GitHub에 업로드하고 배포하는 방법을 설명합니다.

## 1. GitHub 저장소 생성 및 업로드

### GitHub에 저장소 만들기

1. **GitHub 웹사이트** (https://github.com)에 접속하여 로그인
2. 우측 상단의 **"+"** 버튼 클릭 → **"New repository"** 선택
3. 저장소 정보 입력:
   - **Repository name**: `tagline-vote-app` (또는 원하는 이름)
   - **Description**: `주간 태그라인 선정 투표 시스템`
   - **Public/Private**: Public 선택 (공개)
   - ⚠️ **"Initialize this repository with a README"는 체크하지 않음**
4. **"Create repository"** 클릭

### 로컬 저장소를 GitHub에 푸시

터미널에서 다음 명령어를 실행하세요:

```bash
# GitHub 원격 저장소 추가 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/tagline-vote-app.git

# 기본 브랜치 이름을 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**예시:**
```bash
git remote add origin https://github.com/johndoe/tagline-vote-app.git
git branch -M main
git push -u origin main
```

푸시가 완료되면 GitHub 저장소 페이지를 새로고침하여 파일이 업로드되었는지 확인하세요.

## 2. GitHub Pages 제한사항

⚠️ **중요**: 이 프로젝트는 **GitHub Pages에 직접 배포할 수 없습니다**.

**이유**:
- GitHub Pages는 **정적 웹사이트**만 호스팅 가능
- 이 프로젝트는 **Node.js 백엔드 서버**가 필요함
- Express 서버, API 엔드포인트, 데이터 저장 기능 등이 필요

**해결 방법**:
1. **로컬에서 실행** (가장 간단)
2. Node.js를 지원하는 **클라우드 플랫폼에 배포**

## 3. 로컬에서 실행 (권장)

가장 간단하고 안정적인 방법입니다:

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/tagline-vote-app.git
cd tagline-vote-app

# 의존성 설치
npm install

# 서버 실행
npm start
```

브라우저에서 접속:
- 관리자 페이지: http://localhost:3000/admin.html
- 아카이브: http://localhost:3000/archive.html

## 4. 온라인 배포 옵션

### 옵션 1: Railway (추천)

**특징**: 무료 티어, GitHub 자동 배포, 간단한 설정

1. [Railway 웹사이트](https://railway.app/) 접속
2. "Start a New Project" 클릭
3. GitHub 계정 연동
4. `tagline-vote-app` 저장소 선택
5. 자동으로 배포됨
6. 생성된 URL로 접속 가능

**예시 URL**: `https://tagline-vote-app.railway.app`

### 옵션 2: Render

**특징**: 무료 티어, 자동 SSL, GitHub 연동

1. [Render 웹사이트](https://render.com/) 접속
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. "Create Web Service" 클릭

### 옵션 3: Heroku

**특징**: 오래된 플랫폼, 안정적

1. [Heroku 웹사이트](https://www.heroku.com/) 접속
2. 새 앱 생성
3. GitHub 연동 또는 Heroku CLI 사용
4. 자동 배포 설정

```bash
# Heroku CLI 사용
heroku create tagline-vote-app
git push heroku main
```

### 옵션 4: Vercel

**특징**: 빠른 배포, 무료 티어

1. [Vercel 웹사이트](https://vercel.com/) 접속
2. "Import Project" 선택
3. GitHub 저장소 연동
4. 자동 배포

## 5. 환경 변수 설정 (배포 시)

클라우드 플랫폼에 배포할 때는 환경 변수를 설정해야 할 수 있습니다:

```env
PORT=3000
NODE_ENV=production
```

대부분의 플랫폼은 `PORT` 환경 변수를 자동으로 설정합니다.

## 6. 배포 후 확인사항

배포가 완료되면 다음을 확인하세요:

- [ ] 관리자 페이지 접속 가능 (`/admin.html`)
- [ ] 멤버 추가/삭제 기능 작동
- [ ] 투표 생성 및 QR코드 생성 작동
- [ ] 투표 페이지 접속 가능
- [ ] 투표 제출 기능 작동
- [ ] 결과 페이지 차트 표시
- [ ] 아카이브 페이지 접속 가능

## 7. 데이터 관리

### 로컬 실행 시
- 데이터는 `data/` 폴더의 JSON 파일에 저장
- 서버 재시작 시에도 데이터 유지

### 클라우드 배포 시
- ⚠️ 서버 재시작 시 데이터가 손실될 수 있음
- 프로덕션 환경에서는 데이터베이스 사용 권장:
  - MongoDB Atlas (무료 티어)
  - PostgreSQL (Heroku, Railway 등에서 제공)
  - Supabase (무료 티어)

## 8. 문제 해결

### "Cannot find module" 에러
```bash
npm install
```

### 포트 충돌
```bash
# 다른 포트로 실행
PORT=3001 npm start
```

### 데이터 손실
- `data/` 폴더를 백업
- 클라우드 배포 시 데이터베이스 사용 고려

## 9. 추가 리소스

- [Node.js 공식 문서](https://nodejs.org/)
- [Express 공식 문서](https://expressjs.com/)
- [Chart.js 문서](https://www.chartjs.org/)
- [Railway 문서](https://docs.railway.app/)
- [Render 문서](https://render.com/docs)

## 10. 결론

**로컬 개발/테스트**: `npm start`로 간단히 실행

**온라인 공유 필요 시**: Railway, Render, Vercel 중 선택하여 배포

**GitHub Pages는 사용 불가**: Node.js 백엔드가 필요하므로

---

문의사항이나 문제가 있으면 GitHub Issues에 등록해주세요!
