# Railway 빌드 실패 해결 가이드

Railway에서 빌드 실패 시 적용한 수정사항입니다.

## 문제점
- Railway "Build image" 단계에서 실패
- 설정 파일 충돌 가능성
- Node.js 버전 불명확

## 적용된 수정사항

### 1. package.json 업데이트
```json
{
  "engines": {
    "node": "18.x"  // Node.js 버전 명시
  },
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'"  // build 스크립트 추가
  }
}
```

**변경사항**:
- Node.js 버전을 18.x로 구체적으로 지정
- `build` 스크립트 추가 (Railway가 요구할 수 있음)
- 메타데이터 추가 (license, keywords)

### 2. railway.json 제거
**이유**: Railway는 package.json만으로도 자동 감지가 잘 됩니다. railway.json이 오히려 충돌을 일으킬 수 있습니다.

### 3. Procfile 추가
```
web: node server.js
```

**이유**:
- Railway/Heroku 스타일 배포에서 명시적으로 시작 명령어 지정
- Nixpacks가 우선적으로 Procfile을 참조

### 4. nixpacks.toml 추가
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

**이유**:
- Railway의 기본 빌드 시스템(Nixpacks) 설정 명시
- Node.js 버전 및 빌드 단계 명확하게 지정

### 5. .gitignore 업데이트
data 폴더 관리에 대한 주석 추가

## Railway 재배포 방법

### 방법 1: Git 푸시로 자동 배포
```bash
git add .
git commit -m "Fix Railway build configuration"
git push origin main
```

Railway가 자동으로 감지하고 재배포합니다.

### 방법 2: Railway 대시보드에서 수동 배포
1. Railway 대시보드 접속
2. 프로젝트 선택
3. **"Deployments"** 탭
4. **"Redeploy"** 버튼 클릭

## 빌드 확인

Railway 대시보드에서 다음을 확인하세요:

1. **Build Logs**
   ```
   ✓ Installing dependencies
   ✓ Running build command
   ✓ Starting application
   ```

2. **Deploy Logs**
   ```
   태그라인 투표 시스템이 시작되었습니다!
   🔗 관리자 페이지: http://localhost:PORT/admin.html
   ```

## 예상 빌드 프로세스

```
1. Nixpacks detects Node.js project
2. Installs Node.js 18.x
3. Runs npm ci (clean install)
4. Runs npm run build (echo message)
5. Starts with npm start (node server.js)
6. App listens on Railway's PORT
```

## 문제 지속 시 체크리스트

- [ ] package.json에 `start` 스크립트 존재
- [ ] Node.js 18.x 사용 (engines 필드)
- [ ] server.js에서 `process.env.PORT` 사용
- [ ] Procfile 존재
- [ ] nixpacks.toml 설정 확인
- [ ] Railway 대시보드에서 빌드 로그 확인

## 추가 디버깅

### Railway CLI 사용 (선택사항)

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 로그 확인
railway logs

# 로컬에서 Railway 환경으로 실행
railway run npm start
```

### 환경 변수 확인

Railway 대시보드에서:
1. **"Variables"** 탭 클릭
2. `PORT` 자동 설정 확인
3. 필요시 추가 환경 변수 설정

### Volume 설정 (데이터 영속성)

빌드 성공 후:
1. **"Volumes"** 탭
2. **"New Volume"** 생성
3. Mount path: `/app/data`

## 예상 결과

빌드 성공 시:
```
✓ Build completed in 45s
✓ Deployed to https://your-app.up.railway.app
✓ Health check passed
```

## 추가 리소스

- [Railway 공식 문서](https://docs.railway.app/)
- [Nixpacks 문서](https://nixpacks.com/)
- [Node.js 배포 가이드](https://docs.railway.app/guides/nodejs)

---

이 수정사항으로 Railway 빌드가 성공해야 합니다. 문제가 지속되면 Railway 대시보드의 빌드 로그를 확인하세요!
