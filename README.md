# 문서 관리 API

NodeJS, Express, PostgreSQL을 사용한 문서 업로드 및 관리 REST API입니다.

## 주요 기능

-   📁 문서 업로드 (이미지, PDF 지원)
-   🖼️ 문서 이미지 조회
-   📋 문서 목록 조회 (페이지네이션, 검색, 필터링 지원)
-   🏷️ 태그 기반 분류
-   🗑️ 문서 삭제 (소프트 삭제)

## 기술 스택

-   **Backend**: Node.js, Express.js
-   **Database**: PostgreSQL
-   **File Upload**: Multer
-   **Deployment**: Railway

## API 엔드포인트

### 1. 문서 업로드

```http
POST /api/documents/upload
Content-Type: multipart/form-data

Body:
- document: 파일 (필수)
- description: 설명 (선택)
- tags: 태그 배열 JSON 또는 쉼표로 구분된 문자열 (선택)
```

### 2. 문서 목록 조회

```http
GET /api/documents?page=1&limit=10&sort=upload_date&order=DESC&search=검색어&mimeType=image/jpeg&tag=태그명
```

### 3. 특정 문서 조회

```http
GET /api/documents/:id
```

### 4. 문서 이미지 조회

```http
GET /api/documents/:id/image
```

### 5. 문서 삭제

```http
DELETE /api/documents/:id
```

## 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 `.env.example`을 참고하여 설정:

```bash
cp .env.example .env
```

### 3. PostgreSQL 설정

로컬에 PostgreSQL을 설치하고 데이터베이스를 생성합니다:

```sql
CREATE DATABASE document_api;
```

### 4. 데이터베이스 초기화

```bash
npm run init-db
```

### 5. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

## Railway 배포

### 1. Railway 계정 및 프로젝트 생성

1. [Railway](https://railway.app)에 가입
2. 새 프로젝트 생성
3. GitHub 저장소 연결

### 2. PostgreSQL 서비스 추가

1. Railway 대시보드에서 "Add Service" 클릭
2. "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경변수가 설정됩니다

### 3. 환경 변수 설정

Railway 대시보드의 Variables 탭에서 다음 환경변수를 설정:

```
NODE_ENV=production
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### 4. 배포

GitHub에 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 5. 데이터베이스 초기화

배포 후 Railway 콘솔에서 데이터베이스를 초기화합니다:

```bash
npm run init-db
```

## 파일 구조

```
├── src/
│   ├── app.js              # 메인 애플리케이션 파일
│   ├── config/
│   │   └── multer.js       # 파일 업로드 설정
│   ├── database/
│   │   ├── connection.js   # 데이터베이스 연결
│   │   ├── init.js         # 데이터베이스 초기화
│   │   └── schema.sql      # 데이터베이스 스키마
│   └── routes/
│       └── documents.js    # 문서 관련 라우트
├── uploads/                # 업로드된 파일 저장소
├── .env.example           # 환경변수 예시
├── package.json
├── railway.json           # Railway 배포 설정
└── README.md
```

## 지원하는 파일 형식

-   이미지: JPEG, PNG, GIF
-   문서: PDF

## 파일 크기 제한

-   기본값: 10MB
-   환경변수 `MAX_FILE_SIZE`로 조정 가능

## 라이센스

MIT License
