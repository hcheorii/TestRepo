# 📋 문서 관리 API 상세 명세서

## 🌐 Base URL

```
Production: web-production-e3b0c1.up.railway.app
Local: http://localhost:3000
```

---

## 1. 서버 상태 확인

### `GET /`

**Query Parameters:** 없음

**Request Body:** 없음

**Response (200 OK):**

```json
{
    "statusCode": 200,
    "message": "문서 관리 API 서버",
    "version": "1.0.0",
    "endpoints": {
        "POST /api/documents/upload": "문서 업로드",
        "GET /api/documents": "문서 목록 조회",
        "GET /api/documents/:id/image": "문서 이미지 조회"
    }
}
```

---

## 2. 문서 업로드

### `POST /api/documents/upload`

**Query Parameters:** 없음

**Request Body:**

```json
Content-Type: multipart/form-data

{
  document: File,          // 필수 - 업로드할 파일
  description: string,     // 선택 - 문서 설명
  tags: string | string[]  // 선택 - 태그 (JSON 배열 또는 쉼표 구분)
}
```

**Response (201 Created):**

```json
{
    "statusCode": 201,
    "message": "문서가 성공적으로 업로드되었습니다.",
    "document": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "originalName": "example.jpg",
        "fileName": "550e8400-e29b-41d4-a716-446655440001.jpg",
        "size": 245760,
        "mimeType": "image/jpeg",
        "description": "샘플 이미지 문서",
        "tags": ["이미지", "테스트"],
        "uploadDate": "2023-12-01T12:00:00.000Z",
        "imageUrl": "https://your-app.up.railway.app/uploads/550e8400-e29b-41d4-a716-446655440001.jpg"
    }
}
```

**Error Response (400 Bad Request):**

```json
{
    "statusCode": 400,
    "error": "업로드할 파일이 없습니다."
}
```

**Error Response (400 Bad Request - 파일 크기 초과):**

```json
{
    "statusCode": 400,
    "error": "파일 크기가 너무 큽니다.",
    "maxSize": "10MB"
}
```

**Error Response (400 Bad Request - 잘못된 파일 형식):**

```json
{
    "statusCode": 400,
    "error": "지원하지 않는 파일 형식입니다. 허용된 형식: image/jpeg, image/png, image/gif, application/pdf"
}
```

---

## 3. 문서 목록 조회

### `GET /api/documents`

**Query Parameters:**

```json
{
  page: number,           // 선택 - 페이지 번호 (기본값: 1)
  limit: number,          // 선택 - 페이지당 항목 수 (기본값: 10)
  sort: string,           // 선택 - 정렬 기준 (upload_date, original_filename, file_size, created_at)
  order: string,          // 선택 - 정렬 순서 (ASC, DESC - 기본값: DESC)
  search: string,         // 선택 - 검색 키워드
  mimeType: string,       // 선택 - MIME 타입 필터
  tag: string            // 선택 - 태그 필터
}
```

**Request Body:** 없음

**Response (200 OK):**

```json
{
    "statusCode": 200,
    "documents": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "originalName": "example.jpg",
            "fileName": "550e8400-e29b-41d4-a716-446655440001.jpg",
            "size": 245760,
            "mimeType": "image/jpeg",
            "description": "샘플 이미지 문서",
            "tags": ["이미지", "테스트"],
            "uploadDate": "2023-12-01T12:00:00.000Z",
            "createdAt": "2023-12-01T12:00:00.000Z",
            "updatedAt": "2023-12-01T12:00:00.000Z",
            "imageUrl": "https://your-app.up.railway.app/uploads/550e8400-e29b-41d4-a716-446655440001.jpg"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 45,
        "itemsPerPage": 10,
        "hasNextPage": true,
        "hasPrevPage": false
    }
}
```

**Error Response (503 Service Unavailable - DB 연결 오류):**

```json
{
    "statusCode": 503,
    "error": "데이터베이스 서비스를 사용할 수 없습니다.",
    "message": "Railway에서 PostgreSQL 서비스가 설정되지 않았거나 연결할 수 없습니다.",
    "instructions": [
        "1. Railway 대시보드에서 PostgreSQL 서비스를 추가해주세요.",
        "2. DATABASE_URL 환경변수가 자동으로 설정되었는지 확인해주세요.",
        "3. 배포 후 데이터베이스 초기화: npm run init-db"
    ]
}
```

---

## 4. 특정 문서 조회

### `GET /api/documents/:id`

**Path Parameters:**

```json
{
  id: string  // 필수 - 문서 고유 ID (UUID)
}
```

**Query Parameters:** 없음

**Request Body:** 없음

**Response (200 OK):**

```json
{
    "statusCode": 200,
    "document": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "originalName": "example.jpg",
        "fileName": "550e8400-e29b-41d4-a716-446655440001.jpg",
        "filePath": "/uploads/550e8400-e29b-41d4-a716-446655440001.jpg",
        "size": 245760,
        "mimeType": "image/jpeg",
        "description": "샘플 이미지 문서",
        "tags": ["이미지", "테스트"],
        "uploadDate": "2023-12-01T12:00:00.000Z",
        "createdAt": "2023-12-01T12:00:00.000Z",
        "updatedAt": "2023-12-01T12:00:00.000Z",
        "imageUrl": "https://your-app.up.railway.app/uploads/550e8400-e29b-41d4-a716-446655440001.jpg"
    }
}
```

**Error Response (404 Not Found):**

```json
{
    "statusCode": 404,
    "error": "문서를 찾을 수 없습니다."
}
```

---

## 5. 문서 이미지 조회

### `GET /api/documents/:id/image`

**Path Parameters:**

```json
{
  id: string  // 필수 - 문서 고유 ID (UUID)
}
```

**Query Parameters:** 없음

**Request Body:** 없음

**Response (200 OK):**

```
Content-Type: image/jpeg | image/png | image/gif | application/pdf
Content-Disposition: inline; filename="원본파일명.jpg"

[바이너리 파일 데이터]
```

**Error Response (404 Not Found - 문서 없음):**

```json
{
    "statusCode": 404,
    "error": "문서를 찾을 수 없습니다."
}
```

**Error Response (404 Not Found - 파일 없음):**

```json
{
    "statusCode": 404,
    "error": "파일을 찾을 수 없습니다."
}
```

---

## 6. 문서 삭제

### `DELETE /api/documents/:id`

**Path Parameters:**

```json
{
  id: string  // 필수 - 문서 고유 ID (UUID)
}
```

**Query Parameters:** 없음

**Request Body:** 없음

**Response (200 OK):**

```json
{
    "statusCode": 200,
    "message": "문서가 성공적으로 삭제되었습니다.",
    "deletedDocument": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "originalName": "example.jpg"
    }
}
```

**Error Response (404 Not Found):**

```json
{
    "statusCode": 404,
    "error": "문서를 찾을 수 없습니다."
}
```

---

## 📊 파일 제약사항

```json
{
    "maxFileSize": 10485760, // 10MB
    "allowedMimeTypes": [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf"
    ],
    "allowedExtensions": [".jpg", ".jpeg", ".png", ".gif", ".pdf"]
}
```

---

## 🔍 예시 요청들

### 문서 업로드 예시

```javascript
const formData = new FormData();
formData.append("document", file);
formData.append("description", "테스트 문서");
formData.append("tags", JSON.stringify(["테스트", "API"]));

fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
});
```

### 문서 목록 조회 예시

```javascript
// 기본 조회
GET /api/documents

// 페이지네이션
GET /api/documents?page=2&limit=5

// 검색
GET /api/documents?search=보고서

// 필터링
GET /api/documents?mimeType=image/jpeg&tag=중요문서

// 정렬
GET /api/documents?sort=file_size&order=ASC
```

### 이미지 표시 예시

```html
<!-- HTML에서 직접 사용 -->
<img
    src="/api/documents/550e8400-e29b-41d4-a716-446655440000/image"
    alt="문서 이미지"
/>

<!-- 새 창에서 열기 (PDF용) -->
<a
    href="/api/documents/550e8400-e29b-41d4-a716-446655440000/image"
    target="_blank"
    >문서 보기</a
>
```

---

## 🚨 공통 오류 응답

### 500 Internal Server Error

```json
{
    "statusCode": 500,
    "error": "서버 내부 오류가 발생했습니다.",
    "details": "상세 오류 정보 (개발 환경에서만)"
}
```

### 503 Service Unavailable (데이터베이스 연결 오류)

```json
{
    "statusCode": 503,
    "error": "데이터베이스 서비스를 사용할 수 없습니다.",
    "message": "Railway에서 PostgreSQL 서비스가 설정되지 않았거나 연결할 수 없습니다.",
    "instructions": [
        "1. Railway 대시보드에서 PostgreSQL 서비스를 추가해주세요.",
        "2. DATABASE_URL 환경변수가 자동으로 설정되었는지 확인해주세요.",
        "3. 배포 후 데이터베이스 초기화: npm run init-db"
    ]
}
```
