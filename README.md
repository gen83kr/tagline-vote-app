# 주간 태그라인 선정 투표 시스템

주간 태그라인 선정을 위한 투표 웹 애플리케이션입니다.

## 주요 기능

### 1. 멤버 관리
- 멤버 추가/삭제 기능
- "팀이름/닉네임" 형식으로 입력 (예: "마케팅팀/김철수")
- 관리자 페이지에서 멤버 목록 관리

### 2. 투표 설정
- 제목 형식: "X월 X주차 태그라인 선정"
- 투표용 QR코드 자동 생성
- QR코드를 스캔하여 누구나 투표 참여 가능
- QR코드 다운로드 및 화면 표시 기능

### 3. 투표 규칙
- 1인당 최대 2표 행사 가능
- 본인 투표 불가 (자기 자신은 선택 불가)
- 투표 진행 중에는 현황 비공개
- 중복 투표 방지

### 4. 투표 관리
- 투표 삭제 기능 (확인 메시지 포함)
- 투표 종료 기능
- 진행 중/종료된 투표 상태 표시

### 5. 결과 확인 및 시각화
- 투표 종료 후 결과 페이지 제공
- **파이 차트(원그래프)** 로 득표 결과 시각화
- Chart.js를 사용한 인터랙티브 차트
- 1위 득표자 금색으로 강조 표시
- 득표순 정렬 및 순위별 목록 제공
- 주차별 투표 결과 아카이브
- 투표 참여자 목록 및 투표 내역 확인

## 기술 스택

- **백엔드**: Node.js, Express
- **프론트엔드**: HTML, CSS, JavaScript (Vanilla)
- **데이터 저장**: JSON 파일 기반
- **QR코드**: qrcode npm 패키지 (서버), Chart.js (CDN)
- **데이터 시각화**: Chart.js v4.4.0
- **디자인**: 반응형 웹 디자인 (모바일 지원)

## 설치 및 실행

### 1. 필수 요구사항
- Node.js 14 이상

### 2. 설치

```bash
cd tagline-vote-app
npm install
```

### 3. 실행

```bash
npm start
```

서버가 시작되면 다음 주소로 접속할 수 있습니다:
- **관리자 페이지**: http://localhost:3000/admin.html
- **아카이브**: http://localhost:3000/archive.html

## 사용 방법

### 1. 멤버 등록
1. 관리자 페이지(http://localhost:3000/admin.html) 접속
2. "멤버 관리" 섹션에서 "팀이름/닉네임" 형식으로 멤버 추가
   - 예: `마케팅팀/김철수`, `개발팀/이영희`
3. 필요시 멤버 삭제 가능

### 2. 투표 생성
1. 관리자 페이지에서 "새 투표 만들기" 섹션으로 이동
2. 월과 주차 입력 (예: 11월 1주차)
3. "투표 생성" 버튼 클릭
4. 자동으로 QR코드 모달 팝업 표시
5. QR코드를 화면 공유하거나 다운로드하여 배포

### 3. QR코드 관리
1. 투표 목록에서 "QR코드 보기" 버튼 클릭
2. QR코드가 큰 화면으로 표시됨
3. "QR코드 다운로드" 버튼으로 이미지 저장
4. 다운로드한 이미지를 프린트하거나 공유

### 4. 투표 참여
1. QR코드를 스마트폰으로 스캔
2. 투표 페이지로 자동 이동
3. 본인의 이름을 "팀이름/닉네임" 형식으로 입력
4. 투표할 멤버 1~2명 선택 (본인 제외)
5. "투표하기" 버튼 클릭

### 5. 투표 종료 및 결과 확인
1. 관리자 페이지의 "투표 목록"에서 종료할 투표 선택
2. "투표 종료" 버튼 클릭
3. "결과 보기" 버튼으로 결과 확인
4. 결과 페이지에서 득표 순위 및 투표 참여자 확인

### 6. 투표 삭제
1. 관리자 페이지의 "투표 목록"에서 삭제할 투표 선택
2. "삭제" 버튼 클릭
3. 확인 메시지에서 "확인" 클릭
4. 투표 데이터가 영구적으로 삭제됨

### 7. 아카이브 조회
1. 아카이브 페이지(http://localhost:3000/archive.html) 접속
2. 지난 투표 목록에서 원하는 투표 클릭
3. 상세 결과 확인

## 프로젝트 구조

```
tagline-vote-app/
├── server.js              # Express 서버 및 API
├── package.json           # 프로젝트 설정
├── data/                  # 데이터 저장 디렉토리
│   ├── members.json       # 멤버 목록
│   └── votes.json         # 투표 데이터
└── public/                # 프론트엔드 파일
    ├── admin.html         # 관리자 페이지
    ├── vote.html          # 투표 페이지
    ├── results.html       # 결과 페이지
    ├── archive.html       # 아카이브 페이지
    ├── css/
    │   └── style.css      # 스타일시트
    └── js/
        ├── admin.js       # 관리자 페이지 로직
        ├── vote.js        # 투표 페이지 로직
        ├── results.js     # 결과 페이지 로직
        └── archive.js     # 아카이브 페이지 로직
```

## API 엔드포인트

### 멤버 관리
- `GET /api/members` - 멤버 목록 조회
- `POST /api/members` - 멤버 추가
- `DELETE /api/members/:id` - 멤버 삭제

### 투표 관리
- `POST /api/votes` - 새 투표 생성
- `GET /api/votes/:id` - 투표 정보 조회
- `POST /api/votes/:id/cast` - 투표하기
- `POST /api/votes/:id/close` - 투표 종료
- `DELETE /api/votes/:id` - 투표 삭제
- `GET /api/votes/:id/results` - 투표 결과 조회
- `GET /api/votes/:id/qrcode` - 투표 QR코드 생성
- `GET /api/archives` - 아카이브된 투표 목록
- `GET /api/votes-admin` - 관리자용 전체 투표 목록

## 주의사항

- 데이터는 `data/` 디렉토리의 JSON 파일에 저장됩니다
- 서버를 재시작해도 데이터는 유지됩니다
- 데이터 백업을 원할 경우 `data/` 디렉토리를 복사하세요
- 로컬 네트워크에서 접근하려면 방화벽 설정이 필요할 수 있습니다

## 보안 고려사항

현재 버전은 로컬 실행을 위한 간단한 구현입니다. 프로덕션 환경에서 사용하려면 다음 사항을 추가로 고려해야 합니다:

- 관리자 인증 추가
- HTTPS 적용
- CORS 설정
- Rate limiting
- 입력 검증 강화
- 데이터베이스 사용 (MongoDB, PostgreSQL 등)

## 주요 기능 하이라이트

### 📱 QR코드 기반 투표
- 투표 생성 시 QR코드 자동 생성
- 모바일 기기로 스캔하여 즉시 투표 참여
- QR코드 다운로드 및 공유 기능

### 📊 데이터 시각화
- Chart.js를 사용한 파이 차트
- 득표 결과를 직관적으로 표시
- 1위 득표자 금색으로 강조
- 퍼센티지와 득표수 표시

### 📋 투표 관리
- 진행 중/종료된 투표 구분
- 투표 삭제 및 종료 기능
- 실시간 투표 현황 확인 (관리자만)

## GitHub 및 배포

### GitHub 저장소
이 프로젝트는 GitHub에 공개되어 있습니다.

**중요**: 이 프로젝트는 Node.js 백엔드 서버가 필요한 풀스택 애플리케이션입니다. GitHub Pages는 정적 사이트만 호스팅하므로, **로컬 환경에서 실행**하거나 Node.js를 지원하는 플랫폼에 배포해야 합니다.

### Railway 배포 가이드 (추천 🚀)

Railway는 무료 티어로 Node.js 애플리케이션을 쉽게 배포할 수 있는 플랫폼입니다.

#### 1단계: Railway 계정 생성
1. [Railway 웹사이트](https://railway.app/) 접속
2. **"Login with GitHub"** 클릭하여 GitHub 계정으로 로그인

#### 2단계: GitHub 저장소 연결
1. Railway 대시보드에서 **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. GitHub 저장소 권한 승인 (처음 한 번만)
4. `tagline-vote-app` 저장소 선택
5. Railway가 자동으로 프로젝트를 감지하고 빌드 시작

#### 3단계: 배포 확인
1. 빌드가 완료되면 **"Deployments"** 탭에서 상태 확인
2. **"Settings"** 탭 → **"Generate Domain"** 클릭
3. 생성된 공개 URL 복사 (예: `tagline-vote-app-production.up.railway.app`)

#### 4단계: 애플리케이션 접속
생성된 도메인 뒤에 `/admin.html`을 붙여 접속:
```
https://your-app.up.railway.app/admin.html
```

#### 환경 변수 (선택사항)
Railway는 `PORT` 환경 변수를 자동으로 설정합니다. 추가 환경 변수가 필요한 경우:
1. Railway 대시보드에서 프로젝트 선택
2. **"Variables"** 탭 클릭
3. 환경 변수 추가

#### 데이터 영속성 주의사항 ⚠️
**중요**: Railway의 기본 파일 시스템은 임시(ephemeral)입니다. 즉, 서버 재시작 시 `data/` 폴더의 내용이 사라집니다.

**해결 방법**:
1. **Railway Volume 사용** (권장)
   - Railway 대시보드 → **"Volumes"** 탭
   - 새 Volume 생성 후 `/app/data` 경로에 마운트

2. **외부 데이터베이스 사용**
   - MongoDB Atlas (무료 티어)
   - PostgreSQL (Railway에서 제공)
   - Supabase (무료 티어)

3. **테스트/데모 용도로만 사용**
   - 데이터가 중요하지 않은 경우 그대로 사용 가능

#### 자동 배포
GitHub 저장소에 새로운 커밋을 푸시하면 Railway가 자동으로 재배포합니다!

```bash
git add .
git commit -m "Update feature"
git push origin main
# Railway가 자동으로 감지하고 재배포
```

---

### 다른 배포 옵션

#### Render
1. [Render 웹사이트](https://render.com/) 접속
2. **"New +"** → **"Web Service"** 선택
3. GitHub 저장소 연결
4. Build Command: `npm install`
5. Start Command: `npm start`

#### Vercel
1. [Vercel 웹사이트](https://vercel.com/) 접속
2. **"Import Project"** 선택
3. GitHub 저장소 연동

#### Heroku
1. [Heroku 웹사이트](https://www.heroku.com/) 접속
2. 새 앱 생성 후 GitHub 연동

---

### 로컬 실행 (개발/테스트)
가장 간단한 방법은 로컬에서 실행하는 것입니다:

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

## 라이선스

MIT

## 기여하기

이 프로젝트는 오픈소스입니다. 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

이슈나 개선 제안이 있으시면 GitHub Issues를 통해 알려주세요!
