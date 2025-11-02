# Railway 배포 상세 가이드

이 문서는 주간 태그라인 투표 시스템을 Railway에 배포하는 상세한 방법을 설명합니다.

## Railway란?

Railway는 GitHub 저장소를 연결하여 간단히 웹 애플리케이션을 배포할 수 있는 플랫폼입니다.

### 장점
- ✅ **무료 티어 제공** (월 $5 크레딧)
- ✅ **GitHub 자동 배포** (push 시 자동 재배포)
- ✅ **자동 HTTPS** (SSL 인증서 자동 설정)
- ✅ **간편한 환경 변수 관리**
- ✅ **Node.js 자동 감지**
- ✅ **Volume 지원** (영구 저장소)

## 단계별 배포 가이드

### 1단계: 사전 준비

#### GitHub 저장소가 없는 경우
```bash
# 프로젝트 디렉토리에서
git init
git add .
git commit -m "Initial commit"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/tagline-vote-app.git
git push -u origin main
```

#### 필수 파일 확인
- [x] `package.json` (start 스크립트 포함)
- [x] `server.js` (PORT 환경 변수 사용)
- [x] `railway.json` (Railway 설정)
- [x] `.env.example` (환경 변수 예시)

### 2단계: Railway 계정 생성

1. **Railway 웹사이트 접속**
   - https://railway.app/ 접속

2. **GitHub으로 로그인**
   - 우측 상단 **"Login"** 클릭
   - **"Login with GitHub"** 선택
   - GitHub 계정 인증

3. **대시보드 확인**
   - 로그인 후 Railway 대시보드로 이동

### 3단계: 프로젝트 생성 및 배포

1. **새 프로젝트 생성**
   - **"New Project"** 버튼 클릭
   - **"Deploy from GitHub repo"** 선택

2. **GitHub 권한 부여** (처음 한 번만)
   - **"Configure GitHub App"** 클릭
   - 저장소 접근 권한 부여:
     - **"Only select repositories"** 선택
     - `tagline-vote-app` 저장소 선택
     - **"Install & Authorize"** 클릭

3. **저장소 선택**
   - 목록에서 `tagline-vote-app` 선택
   - Railway가 자동으로 감지하고 빌드 시작

4. **빌드 진행 상황 확인**
   - **"Deployments"** 탭에서 빌드 로그 확인
   - 녹색 체크 표시가 나올 때까지 대기 (약 1-2분)

### 4단계: 도메인 생성

1. **Settings 탭 이동**
   - 프로젝트 대시보드에서 **"Settings"** 클릭

2. **공개 도메인 생성**
   - **"Networking"** 섹션 찾기
   - **"Generate Domain"** 버튼 클릭
   - 생성된 URL 확인:
     - 예: `tagline-vote-app-production.up.railway.app`

3. **도메인 복사**
   - URL 옆의 복사 아이콘 클릭

### 5단계: 애플리케이션 접속

생성된 도메인으로 접속:

```
https://your-app-name.up.railway.app/admin.html
```

**주요 페이지**:
- 관리자: `/admin.html`
- 투표: `/vote.html?id={투표ID}`
- 결과: `/results.html?id={투표ID}`
- 아카이브: `/archive.html`

### 6단계: Volume 설정 (데이터 영속성)

⚠️ **중요**: Railway의 기본 파일 시스템은 임시(ephemeral)입니다. 서버 재시작 시 데이터가 사라집니다!

#### Volume 생성 방법

1. **Volumes 탭 이동**
   - 프로젝트 대시보드에서 **"Volumes"** 클릭

2. **새 Volume 생성**
   - **"New Volume"** 버튼 클릭
   - Volume 이름: `tagline-data`
   - Mount Path: `/app/data`
   - **"Add"** 클릭

3. **재배포**
   - Volume 추가 후 자동으로 재배포됨
   - **"Deployments"** 탭에서 확인

4. **데이터 확인**
   - 이제 `/app/data` 경로의 데이터가 영구 저장됨
   - `members.json`과 `votes.json`이 유지됨

## 환경 변수 설정

### 자동 설정되는 변수
Railway가 자동으로 설정:
- `PORT` - Railway가 할당한 포트 번호
- `RAILWAY_ENVIRONMENT` - 환경 (production)
- `RAILWAY_PROJECT_NAME` - 프로젝트 이름

### 추가 변수 설정 (선택사항)

1. **Variables 탭 이동**
   - 프로젝트 대시보드에서 **"Variables"** 클릭

2. **변수 추가**
   - **"New Variable"** 클릭
   - Key: `NODE_ENV`
   - Value: `production`
   - **"Add"** 클릭

3. **재배포**
   - 변수 변경 시 자동 재배포

## 자동 배포 (CI/CD)

GitHub에 푸시하면 자동으로 재배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "Update feature"
git push origin main

# Railway가 자동으로 감지하고 재배포
# 대시보드에서 배포 진행 상황 확인 가능
```

### 배포 알림 설정

1. **Notifications 설정**
   - Railway 대시보드 → 프로젝트 → **"Settings"**
   - **"Notifications"** 섹션
   - 이메일 또는 Discord 웹훅 설정 가능

## 비용 및 무료 티어

### 무료 티어 ($5 크레딧/월)
- **Hobby Plan** (무료)
- 월 $5 크레딧 제공
- 소규모 프로젝트에 충분
- 512MB RAM, 공유 CPU

### 사용량 확인
1. Railway 대시보드 → **"Usage"** 탭
2. 현재 사용량 및 남은 크레딧 확인

### 예상 비용
일반적인 사용의 경우 무료 티어로 충분:
- 월간 방문자 수천 명까지 지원
- 데이터 전송 100GB/월

## 로그 확인

### 실시간 로그 보기
1. **Deployments 탭** 이동
2. 최신 배포 선택
3. **"View Logs"** 클릭
4. 실시간 로그 확인

### 에러 디버깅
서버 에러 발생 시:
```bash
# 로그에서 확인할 내용
- "Error" 키워드 검색
- PORT 바인딩 확인
- npm start 실행 여부
- 모듈 로드 에러
```

## 커스텀 도메인 연결 (선택사항)

자신의 도메인을 연결하려면:

1. **Settings → Domains**
2. **"Custom Domain"** 입력
3. DNS 설정 (제공된 CNAME 레코드 추가)
4. 적용 완료 (약 24시간 소요)

## 문제 해결

### 빌드 실패
```bash
# 로컬에서 테스트
npm install
npm start

# package.json 확인
"scripts": {
  "start": "node server.js"
}
```

### 서버 시작 실패
```bash
# server.js에서 PORT 환경 변수 확인
const PORT = process.env.PORT || 3000;
```

### 데이터 손실
```bash
# Volume이 마운트되었는지 확인
# Railway Dashboard → Volumes 탭

# Volume 경로: /app/data
# 로컬 경로: ./data
```

### 502 Bad Gateway
- 서버가 시작되지 않음
- 로그 확인: Deployments → View Logs
- PORT 바인딩 확인

## 모니터링

### 상태 확인
Railway 대시보드에서:
- **Deployments**: 배포 이력
- **Metrics**: CPU, 메모리 사용량
- **Logs**: 실시간 로그

### 외부 모니터링 (선택사항)
- UptimeRobot (무료)
- Pingdom
- StatusCake

## 백업 및 복원

### 데이터 백업
Volume 사용 시 데이터는 영구 저장되지만, 정기적인 백업 권장:

```bash
# 로컬에서 백업 스크립트 실행
# (별도 구현 필요)
```

### 프로젝트 복원
1. GitHub 저장소에서 코드 복원
2. Railway에서 새 프로젝트 생성
3. Volume 다시 마운트
4. 데이터 복구

## 다음 단계

배포 완료 후:

1. ✅ 관리자 페이지 접속 테스트
2. ✅ 멤버 추가/삭제 기능 테스트
3. ✅ 투표 생성 및 QR코드 테스트
4. ✅ 투표 참여 테스트
5. ✅ 결과 페이지 차트 확인
6. ✅ Volume 설정 (데이터 영속성)
7. ✅ 커스텀 도메인 연결 (선택)

## 유용한 링크

- [Railway 공식 문서](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway 블로그](https://blog.railway.app/)
- [Railway 상태 페이지](https://status.railway.app/)

## 결론

Railway를 사용하면 복잡한 설정 없이 몇 분 만에 Node.js 애플리케이션을 배포할 수 있습니다!

**핵심 단계**:
1. GitHub 저장소 생성
2. Railway에서 저장소 연결
3. 도메인 생성
4. Volume 설정 (데이터 영속성)
5. 배포 완료!

---

문의사항이나 문제가 있으면 GitHub Issues에 등록해주세요!
