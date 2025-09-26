# API 테스트 가이드 📋

Railway 배포 완료 후 API 기능을 테스트하는 방법입니다.

## 🌐 배포된 서버 URL 확인

Railway 대시보드에서:
1. 백엔드 서비스 클릭
2. **Settings** → **Networking** → **Public Networking**
3. **Generate Domain** 버튼 클릭 (아직 안했다면)
4. 생성된 URL 복사 (예: `https://my-backend.up.railway.app`)

## 🧪 1. 기본 연결 테스트

### 브라우저에서 확인
```
https://your-app.up.railway.app/
```

**성공 응답:**
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

## 📄 2. 문서 목록 조회 테스트

### 브라우저에서 확인
```
https://your-app.up.railway.app/api/documents
```

**성공 응답 (빈 목록):**
```json
{
  "documents": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalItems": 0,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## 📤 3. 문서 업로드 테스트

### Postman 사용
1. **POST** 요청 생성
2. URL: `https://your-app.up.railway.app/api/documents/upload`
3. **Body** → **form-data** 선택
4. 다음 필드 추가:
   - `document` (File): 이미지 파일 또는 PDF 선택
   - `description` (Text): "테스트 문서"
   - `tags` (Text): `["테스트", "API"]` 또는 `테스트,API`

### cURL 사용
```bash
curl -X POST https://your-app.up.railway.app/api/documents/upload \
  -F "document=@/path/to/your/file.jpg" \
  -F "description=테스트 문서" \
  -F "tags=테스트,API"
```

**성공 응답:**
```json
{
  "message": "문서가 성공적으로 업로드되었습니다.",
  "document": {
    "id": "uuid-here",
    "originalName": "file.jpg",
    "fileName": "unique-filename.jpg",
    "size": 245760,
    "mimeType": "image/jpeg",
    "description": "테스트 문서",
    "tags": ["테스트", "API"],
    "uploadDate": "2023-12-01T12:00:00.000Z",
    "imageUrl": "https://your-app.up.railway.app/uploads/unique-filename.jpg"
  }
}
```

## 🖼️ 4. 문서 이미지 조회 테스트

업로드 성공 후 받은 `document.id`를 사용:

### 브라우저에서 확인
```
https://your-app.up.railway.app/api/documents/{document-id}/image
```

- 이미지 파일이 브라우저에 표시되어야 합니다
- PDF의 경우 다운로드되거나 PDF 뷰어에서 열립니다

## 🔍 5. 특정 문서 조회 테스트

### 브라우저에서 확인
```
https://your-app.up.railway.app/api/documents/{document-id}
```

**성공 응답:**
```json
{
  "document": {
    "id": "uuid-here",
    "originalName": "file.jpg",
    "fileName": "unique-filename.jpg",
    "filePath": "/uploads/unique-filename.jpg",
    "size": 245760,
    "mimeType": "image/jpeg",
    "description": "테스트 문서",
    "tags": ["테스트", "API"],
    "uploadDate": "2023-12-01T12:00:00.000Z",
    "createdAt": "2023-12-01T12:00:00.000Z",
    "updatedAt": "2023-12-01T12:00:00.000Z",
    "imageUrl": "https://your-app.up.railway.app/uploads/unique-filename.jpg"
  }
}
```

## 🗑️ 6. 문서 삭제 테스트

### Postman 사용
1. **DELETE** 요청 생성
2. URL: `https://your-app.up.railway.app/api/documents/{document-id}`

### cURL 사용
```bash
curl -X DELETE https://your-app.up.railway.app/api/documents/{document-id}
```

**성공 응답:**
```json
{
  "message": "문서가 성공적으로 삭제되었습니다.",
  "deletedDocument": {
    "id": "uuid-here",
    "originalName": "file.jpg"
  }
}
```

## 🔍 7. 고급 검색 테스트

### 페이지네이션
```
https://your-app.up.railway.app/api/documents?page=1&limit=5
```

### 검색
```
https://your-app.up.railway.app/api/documents?search=테스트
```

### 파일 타입 필터링
```
https://your-app.up.railway.app/api/documents?mimeType=image/jpeg
```

### 태그 필터링
```
https://your-app.up.railway.app/api/documents?tag=테스트
```

### 정렬
```
https://your-app.up.railway.app/api/documents?sort=upload_date&order=ASC
```

## ❌ 오류 상황 테스트

### 1. 데이터베이스 연결 오류 (PostgreSQL 미설정 시)
모든 API 요청에 대해 다음 응답:
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

### 2. 잘못된 파일 형식 업로드
지원하지 않는 파일 (예: .txt, .doc) 업로드 시:
```json
{
  "error": "지원하지 않는 파일 형식입니다. 허용된 형식: image/jpeg, image/png, image/gif, application/pdf"
}
```

### 3. 파일 크기 초과
10MB 초과 파일 업로드 시:
```json
{
  "error": "파일 크기가 너무 큽니다.",
  "maxSize": "10MB"
}
```

### 4. 존재하지 않는 문서 조회
```json
{
  "error": "문서를 찾을 수 없습니다."
}
```

## ✅ 테스트 체크리스트

- [ ] 기본 서버 응답 확인
- [ ] 빈 문서 목록 조회
- [ ] 문서 업로드 (이미지)
- [ ] 문서 업로드 (PDF)
- [ ] 업로드된 이미지 브라우저에서 확인
- [ ] 특정 문서 정보 조회
- [ ] 문서 목록에서 업로드된 문서 확인
- [ ] 검색 기능 테스트
- [ ] 태그 필터링 테스트
- [ ] 문서 삭제 테스트
- [ ] 오류 상황 테스트

## 🛠️ 추가 도구

### Postman Collection
API 테스트를 위한 Postman Collection을 만들어 팀과 공유할 수 있습니다.

### HTTP 클라이언트 파일
VS Code의 REST Client 확장을 사용하여 `.http` 파일로 테스트할 수도 있습니다.

```http
### 기본 서버 테스트
GET https://your-app.up.railway.app/

### 문서 목록 조회
GET https://your-app.up.railway.app/api/documents

### 문서 업로드
POST https://your-app.up.railway.app/api/documents/upload
Content-Type: multipart/form-data; boundary=boundary

--boundary
Content-Disposition: form-data; name="document"; filename="test.jpg"
Content-Type: image/jpeg

< /path/to/test.jpg
--boundary
Content-Disposition: form-data; name="description"

테스트 문서
--boundary
Content-Disposition: form-data; name="tags"

테스트,API
--boundary--
```

모든 테스트가 성공하면 API가 정상적으로 작동하는 것입니다! 🎉
