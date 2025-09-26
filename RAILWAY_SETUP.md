# Railway 배포 및 PostgreSQL 설정 가이드

Railway에서 PostgreSQL 연결 오류(`ECONNREFUSED ::1:5432`)가 발생했습니다. 이 문제를 해결하기 위한 단계별 가이드입니다.

## 🔍 문제 진단

현재 오류는 애플리케이션이 PostgreSQL 데이터베이스에 연결할 수 없어서 발생합니다. Railway에서는 별도로 PostgreSQL 서비스를 추가해야 합니다.

## 🚀 Railway에서 PostgreSQL 설정하기

### 1. PostgreSQL 서비스 추가

1. **Railway 대시보드 접속**

    - https://railway.app 에 로그인
    - 배포된 프로젝트 선택

2. **PostgreSQL 서비스 추가**

    ```
    Project Dashboard → Add Service → PostgreSQL
    ```

    - "Add Service" 버튼 클릭
    - "PostgreSQL" 선택
    - 자동으로 PostgreSQL 인스턴스가 생성됩니다

3. **환경변수 자동 설정 확인**
    - PostgreSQL 서비스가 추가되면 `DATABASE_URL`이 자동으로 설정됩니다
    - Variables 탭에서 `DATABASE_URL` 존재 확인

### 2. 환경변수 확인 및 설정

Railway 프로젝트의 **Variables** 탭에서 다음 변수들을 확인/설정하세요:

```bash
# 자동으로 설정됨 (PostgreSQL 서비스 추가 시)
DATABASE_URL=postgresql://username:password@hostname:port/database

# 수동으로 설정해야 함
NODE_ENV=production
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### 3. 데이터베이스 초기화

PostgreSQL 서비스가 추가된 후:

1. **애플리케이션 재배포**

    ```bash
    git add .
    git commit -m "데이터베이스 연결 로직 개선"
    git push origin main
    ```

2. **Railway 콘솔에서 데이터베이스 초기화**
    - Railway 대시보드에서 애플리케이션 서비스 선택
    - "Deploy Logs" 탭에서 배포 완료 확인
    - "Console" 탭 또는 "Logs" 탭에서 명령 실행:
    ```bash
    npm run init-db
    ```

### 4. 연결 확인

배포 완료 후 애플리케이션 URL 접속:

```
https://your-app.railway.app/
```

성공 시 다음과 같은 응답을 받아야 합니다:

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

## 🔧 대안 방법 (수동 PostgreSQL 설정)

만약 자동 PostgreSQL 추가가 안 된다면:

### 1. 외부 PostgreSQL 사용

-   **Supabase** (무료): https://supabase.com
-   **ElephantSQL** (무료): https://www.elephantsql.com
-   **Railway PostgreSQL** 직접 생성

### 2. Supabase 설정 예시

1. Supabase 프로젝트 생성
2. Database → Settings → Connection string 복사
3. Railway Variables에 `DATABASE_URL` 설정:
    ```
    postgresql://postgres:password@db.project.supabase.co:5432/postgres
    ```

## 🏃‍♂️ 빠른 해결 방법

**현재 상황에서 즉시 해결하려면:**

1. **Railway 대시보드 접속**
2. **PostgreSQL 서비스 추가** (Add Service → PostgreSQL)
3. **재배포 대기** (자동으로 진행됨)
4. **데이터베이스 초기화** (Railway 콘솔에서 `npm run init-db`)

## 📋 체크리스트

-   [ ] Railway에 PostgreSQL 서비스 추가됨
-   [ ] `DATABASE_URL` 환경변수 자동 설정됨
-   [ ] 애플리케이션 재배포 완료
-   [ ] 데이터베이스 초기화 실행 (`npm run init-db`)
-   [ ] API 엔드포인트 접속 테스트

## 🆘 여전히 문제가 있다면

1. **Railway 로그 확인**

    - Deploy Logs에서 자세한 오류 메시지 확인
    - Runtime Logs에서 애플리케이션 실행 상태 확인

2. **환경변수 재확인**

    ```bash
    echo $DATABASE_URL  # 콘솔에서 확인
    ```

3. **다른 PostgreSQL 공급자 사용**
    - Supabase, ElephantSQL 등 외부 서비스 활용

## 📞 도움이 필요하시면

Railway 커뮤니티 또는 문서에서 더 자세한 정보를 확인할 수 있습니다:

-   Railway Docs: https://docs.railway.app
-   Railway Discord: https://discord.gg/railway
