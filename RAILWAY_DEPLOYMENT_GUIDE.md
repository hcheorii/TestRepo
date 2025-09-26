# Railway 배포 완벽 가이드 🚀

이 가이드는 NodeJS + PostgreSQL 프로젝트를 Railway에 배포하는 단계별 방법입니다.

## 📋 사전 준비

-   [x] NodeJS 프로젝트 완성 (현재 프로젝트)
-   [x] GitHub 저장소에 코드 업로드
-   [ ] Railway 계정 생성

## 🚀 1단계: Railway 회원가입 및 프로젝트 생성

### 1.1 Railway 가입

1. https://railway.app 접속
2. **"Login with GitHub"** 클릭하여 GitHub 계정으로 로그인

### 1.2 백엔드 서버 배포

1. **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. 이 프로젝트가 올라간 **GitHub 저장소** 선택
4. 자동으로 배포가 시작됩니다

### 1.3 PostgreSQL 데이터베이스 추가

1. 방금 생성한 프로젝트 대시보드에서 **"Add Service"** 클릭
2. **"PostgreSQL"** 선택
3. PostgreSQL 서비스가 자동으로 생성됩니다

⚠️ **중요**: 백엔드 서버와 PostgreSQL이 **반드시 같은 Railway 프로젝트 내**에 있어야 합니다!

## 🔧 2단계: PostgreSQL 연결 설정

### 2.1 PostgreSQL 접속 정보 확인

1. **PostgreSQL 서비스** 클릭
2. **"Variables"** 탭에서 다음 정보 확인:
    ```
    PGHOST = Private Networking 주소
    PGPORT = 포트 번호
    PGUSER = 사용자명
    PGPASSWORD = 비밀번호
    PGDATABASE = 데이터베이스명
    ```

### 2.2 백엔드 서버 환경변수 설정

1. **백엔드 서비스** 클릭 (NodeJS 앱)
2. **"Variables"** 탭 클릭
3. 다음 환경변수들을 **추가**:

```bash
# PostgreSQL 연결 정보 (위에서 확인한 값들을 입력)
DB_HOST=PGHOST_값
DB_PORT=PGPORT_값
DB_USER=PGUSER_값
DB_PASSWORD=PGPASSWORD_값
DB_NAME=PGDATABASE_값

# 또는 더 간단하게 DATABASE_URL 사용 (자동으로 설정됨)
DATABASE_URL=postgresql://user:password@host:port/database

# 추가 설정
NODE_ENV=production
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### 2.3 재배포

환경변수 설정 후 **"Redeploy"** 버튼을 클릭합니다.

## 🗄️ 3단계: 데이터베이스 초기화

### 3.1 테이블 생성

배포가 완료되면 다음 중 하나의 방법으로 데이터베이스를 초기화합니다:

**방법 1: Railway 콘솔 사용**

1. 백엔드 서비스 → **"Console"** 탭
2. 다음 명령어 실행:
    ```bash
    npm run init-db
    ```

**방법 2: PostgreSQL 직접 접속**

1. PostgreSQL 서비스 → **"Query"** 탭
2. `src/database/schema.sql` 파일의 내용을 복사하여 실행

### 3.2 샘플 데이터 추가 (선택사항)

PostgreSQL 서비스에서 **"Data"** 탭을 통해 직접 데이터를 추가할 수 있습니다.

## 🌐 4단계: 도메인 설정 및 테스트

### 4.1 공개 도메인 생성

1. 백엔드 서비스 → **"Settings"** → **"Networking"**
2. **"Public Networking"** 섹션에서 **"Generate Domain"** 클릭
3. 생성된 URL 확인 (예: `https://my-backend.up.railway.app`)

### 4.2 API 테스트

브라우저나 Postman에서 다음 엔드포인트들을 테스트:

```bash
# 기본 정보 확인
GET https://your-app.up.railway.app/

# 문서 목록 조회
GET https://your-app.up.railway.app/api/documents

# 문서 업로드 (Postman에서 테스트)
POST https://your-app.up.railway.app/api/documents/upload
Content-Type: multipart/form-data
Body: document (파일), description (텍스트), tags (텍스트)
```

## ✅ 5단계: 배포 확인

### 5.1 로그 확인

1. 백엔드 서비스 → **"Deployments"** → **"View Logs"**
2. 다음과 같은 성공 메시지 확인:
    ```
    서버가 포트 XXXX에서 실행 중입니다.
    PostgreSQL 데이터베이스 연결 성공
    ```

### 5.2 데이터베이스 연결 확인

브라우저에서 기본 URL 접속 시 다음과 같은 응답이 나와야 합니다:

```json
{
    "message": "문서 관리 API 서버",
    "version": "1.0.0",
    "endpoints": {
        "POST /api/documents/upload": "문서 업로드",
        "GET /api/documents": "문서 목록 조회",
        "GET /api/documents/:id/image": "문서 이미지 조회"
    }
}
```

## 🚨 문제 해결

### Railway 배포 시 자주 발생하는 문제들:

#### 1. `ECONNREFUSED` 오류

**원인**: PostgreSQL 서비스가 추가되지 않았거나 환경변수 설정 오류
**해결**: PostgreSQL 서비스 추가 후 환경변수 재설정

#### 2. `DATABASE_URL` 인식 안됨

**원인**: 백엔드와 PostgreSQL이 다른 프로젝트에 있음
**해결**: 같은 프로젝트 내에 두 서비스 모두 생성

#### 3. 파일 업로드 실패

**원인**: Railway의 임시 파일 시스템 특성
**해결**: 현재 프로젝트는 이미 올바르게 설정됨

#### 4. 환경변수 적용 안됨

**원인**: 환경변수 설정 후 재배포 안함
**해결**: Variables 탭에서 설정 후 반드시 Redeploy

## 🎯 성공 확인 체크리스트

-   [ ] Railway에 프로젝트 생성됨
-   [ ] PostgreSQL 서비스 추가됨 (같은 프로젝트 내)
-   [ ] 환경변수 설정 완료
-   [ ] 재배포 완료
-   [ ] 데이터베이스 초기화 완료
-   [ ] 공개 도메인 생성됨
-   [ ] API 엔드포인트 정상 응답
-   [ ] 문서 업로드/조회 기능 테스트 완료

## 🔗 추가 자료

-   Railway 공식 문서: https://docs.railway.app
-   PostgreSQL 관리: Railway Dashboard → PostgreSQL Service → Data/Query
-   로그 모니터링: Railway Dashboard → Service → Deployments → View Logs

배포가 완료되면 여러분의 문서 관리 API가 전 세계에서 접근 가능합니다! 🌟
