# 문서 관리 API 명세서 📋

## 🌐 Base URL

```
Production: https://your-app.up.railway.app
Local: http://localhost:3000
```

## 📑 목차

-   [1. 서버 상태 확인](#1-서버-상태-확인)
-   [2. 문서 업로드](#2-문서-업로드)
-   [3. 문서 목록 조회](#3-문서-목록-조회)
-   [4. 특정 문서 조회](#4-특정-문서-조회)
-   [5. 문서 이미지 조회](#5-문서-이미지-조회)
-   [6. 문서 삭제](#6-문서-삭제)
-   [7. 오류 응답](#7-오류-응답)

---

## 1. 서버 상태 확인

### `GET /`

서버 상태와 사용 가능한 API 엔드포인트 목록을 반환합니다.

#### 요청

```http
GET /
```

#### 응답

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

---

## 2. 문서 업로드

### `POST /api/documents/upload`

새로운 문서를 업로드합니다. 이미지 파일(JPEG, PNG, GIF) 및 PDF 파일을 지원합니다.

#### 요청

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

#### Body Parameters

| Parameter     | Type         | Required | Description                                |
| ------------- | ------------ | -------- | ------------------------------------------ |
| `document`    | File         | ✅       | 업로드할 파일 (이미지 또는 PDF)            |
| `description` | String       | ❌       | 문서 설명                                  |
| `tags`        | String/Array | ❌       | 태그 (JSON 배열 또는 쉼표로 구분된 문자열) |

#### 예시 요청 (cURL)

```bash
curl -X POST https://your-app.up.railway.app/api/documents/upload \
  -F "document=@example.jpg" \
  -F "description=샘플 이미지 문서" \
  -F "tags=[\"이미지\", \"테스트\"]"
```

#### 성공 응답 (201 Created)

```json
{
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

#### 오류 응답

-   **400 Bad Request**: 파일 없음, 잘못된 파일 형식, 파일 크기 초과
-   **503 Service Unavailable**: 데이터베이스 연결 오류

---

## 3. 문서 목록 조회

### `GET /api/documents`

등록된 문서 목록을 조회합니다. 페이지네이션, 검색, 필터링, 정렬을 지원합니다.

#### 요청

```http
GET /api/documents?page=1&limit=10&sort=upload_date&order=DESC&search=keyword&mimeType=image/jpeg&tag=태그명
```

#### Query Parameters

| Parameter  | Type    | Default     | Description                                                               |
| ---------- | ------- | ----------- | ------------------------------------------------------------------------- |
| `page`     | Integer | 1           | 페이지 번호                                                               |
| `limit`    | Integer | 10          | 페이지당 항목 수                                                          |
| `sort`     | String  | upload_date | 정렬 기준 (`upload_date`, `original_filename`, `file_size`, `created_at`) |
| `order`    | String  | DESC        | 정렬 순서 (`ASC`, `DESC`)                                                 |
| `search`   | String  | -           | 파일명 또는 설명으로 검색                                                 |
| `mimeType` | String  | -           | MIME 타입으로 필터링                                                      |
| `tag`      | String  | -           | 태그로 필터링                                                             |

#### 예시 요청

```bash
# 기본 목록 조회
GET /api/documents

# 검색 + 필터링
GET /api/documents?search=테스트&mimeType=image/jpeg&page=1&limit=5

# 태그로 필터링
GET /api/documents?tag=이미지&sort=file_size&order=ASC
```

#### 성공 응답 (200 OK)

```json
{
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

---

## 4. 특정 문서 조회

### `GET /api/documents/:id`

특정 문서의 상세 정보를 조회합니다.

#### 요청

```http
GET /api/documents/{document-id}
```

#### Path Parameters

| Parameter | Type | Required | Description  |
| --------- | ---- | -------- | ------------ |
| `id`      | UUID | ✅       | 문서 고유 ID |

#### 예시 요청

```bash
GET /api/documents/550e8400-e29b-41d4-a716-446655440000
```

#### 성공 응답 (200 OK)

```json
{
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

#### 오류 응답

-   **404 Not Found**: 문서를 찾을 수 없음

---

## 5. 문서 이미지 조회

### `GET /api/documents/:id/image`

문서의 실제 파일을 반환합니다. 브라우저에서 직접 이미지를 표시하거나 PDF를 다운로드할 수 있습니다.

#### 요청

```http
GET /api/documents/{document-id}/image
```

#### Path Parameters

| Parameter | Type | Required | Description  |
| --------- | ---- | -------- | ------------ |
| `id`      | UUID | ✅       | 문서 고유 ID |

#### 예시 요청

```bash
GET /api/documents/550e8400-e29b-41d4-a716-446655440000/image
```

#### 성공 응답 (200 OK)

-   **Content-Type**: 파일의 실제 MIME 타입 (`image/jpeg`, `application/pdf` 등)
-   **Content-Disposition**: `inline; filename="원본파일명.jpg"`
-   **Body**: 실제 파일 데이터 (바이너리)

#### 사용 예시

```html
<!-- HTML에서 이미지로 직접 사용 -->
<img
    src="https://your-app.up.railway.app/api/documents/550e8400-e29b-41d4-a716-446655440000/image"
    alt="문서 이미지"
/>

<!-- 링크로 사용 (PDF 다운로드 등) -->
<a
    href="https://your-app.up.railway.app/api/documents/550e8400-e29b-41d4-a716-446655440000/image"
    target="_blank"
    >문서 보기</a
>
```

#### 오류 응답

-   **404 Not Found**: 문서를 찾을 수 없음 또는 파일이 존재하지 않음

---

## 6. 문서 삭제

### `DELETE /api/documents/:id`

문서를 삭제합니다. (소프트 삭제 - 실제 파일은 유지되고 DB에서만 비활성화)

#### 요청

```http
DELETE /api/documents/{document-id}
```

#### Path Parameters

| Parameter | Type | Required | Description  |
| --------- | ---- | -------- | ------------ |
| `id`      | UUID | ✅       | 문서 고유 ID |

#### 예시 요청

```bash
curl -X DELETE https://your-app.up.railway.app/api/documents/550e8400-e29b-41d4-a716-446655440000
```

#### 성공 응답 (200 OK)

```json
{
    "message": "문서가 성공적으로 삭제되었습니다.",
    "deletedDocument": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "originalName": "example.jpg"
    }
}
```

#### 오류 응답

-   **404 Not Found**: 문서를 찾을 수 없음

---

## 7. 오류 응답

### 공통 오류 형식

```json
{
    "error": "오류 메시지",
    "details": "상세 오류 정보 (개발 환경에서만)"
}
```

### HTTP 상태 코드

| Code | Description                                  |
| ---- | -------------------------------------------- |
| 200  | OK - 요청 성공                               |
| 201  | Created - 리소스 생성 성공                   |
| 400  | Bad Request - 잘못된 요청                    |
| 404  | Not Found - 리소스를 찾을 수 없음            |
| 500  | Internal Server Error - 서버 내부 오류       |
| 503  | Service Unavailable - 데이터베이스 연결 불가 |

### 데이터베이스 연결 오류 (503)

```json
{
    "error": "데이터베이스 서비스를 사용할 수 없습니다.",
    "message": "Railway에서 PostgreSQL 서비스가 설정되지 않았거나 연결할 수 없습니다.",
    "instructions": [
        "1. Railway 대시보드에서 PostgreSQL 서비스를 추가해주세요.",
        "2. DATABASE_URL 환경변수가 자동으로 설정되었는지 확인해주세요.",
        "3. 배포 후 데이터베이스 초기화: npm run init-db"
    ]
}
```

### 파일 업로드 오류 (400)

```json
{
    "error": "파일 크기가 너무 큽니다.",
    "maxSize": "10MB"
}
```

```json
{
    "error": "지원하지 않는 파일 형식입니다. 허용된 형식: image/jpeg, image/png, image/gif, application/pdf"
}
```

---

## 📊 지원하는 파일 형식

| 형식 | MIME Type         | 확장자          | 최대 크기 |
| ---- | ----------------- | --------------- | --------- |
| JPEG | `image/jpeg`      | `.jpg`, `.jpeg` | 10MB      |
| PNG  | `image/png`       | `.png`          | 10MB      |
| GIF  | `image/gif`       | `.gif`          | 10MB      |
| PDF  | `application/pdf` | `.pdf`          | 10MB      |

---

## 🔧 환경 설정

### 환경변수

| Variable             | Description            | Default                                          |
| -------------------- | ---------------------- | ------------------------------------------------ |
| `NODE_ENV`           | 실행 환경              | `development`                                    |
| `PORT`               | 서버 포트              | `3000`                                           |
| `DATABASE_URL`       | PostgreSQL 연결 문자열 | -                                                |
| `MAX_FILE_SIZE`      | 최대 파일 크기 (bytes) | `10485760` (10MB)                                |
| `ALLOWED_FILE_TYPES` | 허용된 파일 형식       | `image/jpeg,image/png,image/gif,application/pdf` |

---

## 🚀 사용 예시

### JavaScript (Fetch API)

```javascript
// 문서 업로드
const formData = new FormData();
formData.append("document", fileInput.files[0]);
formData.append("description", "테스트 문서");
formData.append("tags", JSON.stringify(["테스트", "API"]));

const response = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
});

const result = await response.json();
console.log(result);

// 문서 목록 조회
const documents = await fetch("/api/documents?page=1&limit=10").then((res) =>
    res.json()
);
console.log(documents);
```

### Python (requests)

```python
import requests

# 문서 업로드
with open('example.jpg', 'rb') as f:
    files = {'document': f}
    data = {
        'description': '테스트 문서',
        'tags': '["테스트", "API"]'
    }
    response = requests.post(
        'https://your-app.up.railway.app/api/documents/upload',
        files=files,
        data=data
    )
    print(response.json())

# 문서 목록 조회
response = requests.get('https://your-app.up.railway.app/api/documents')
print(response.json())
```

---

이 API 명세서를 참고하여 프론트엔드나 다른 서비스와 연동하실 수 있습니다! 🎉
