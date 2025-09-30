const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const documentRoutes = require("./routes/documents");
const { connectDB } = require("./database/connection");

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors({
    origin: true, // 모든 오리진 허용 (개발용)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 한글 파일명 처리를 위한 설정
app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        // multipart/form-data에서 파일명 인코딩 처리
        req.encoding = 'utf8';
    }
    next();
});

// 정적 파일 제공 (업로드된 파일용)
app.use("/uploads", (req, res, next) => {
    // PDF 파일에 대한 특별한 헤더 설정
    if (req.path.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Frame-Options', 'ALLOWALL'); // iframe 허용을 더 관대하게
        res.setHeader('Content-Security-Policy', 'default-src *; frame-ancestors *;'); // CSP 완화
        res.setHeader('Content-Disposition', 'inline'); // 브라우저에서 직접 보기
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
}, express.static(path.join(__dirname, "../uploads")));

// 라우트 설정
app.use("/api/documents", documentRoutes);

// 기본 라우트
app.get("/", (req, res) => {
    res.json({
        message: "문서 관리 API 서버",
        version: "1.0.0",
        endpoints: {
            "POST /api/documents/upload": "문서 업로드",
            "GET /api/documents": "문서 목록 조회",
            "GET /api/documents/:id/image": "문서 이미지 조회",
        },
    });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "서버 내부 오류가 발생했습니다.",
        message:
            process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// 404 핸들러
app.use("*", (req, res) => {
    res.status(404).json({ error: "요청한 리소스를 찾을 수 없습니다." });
});

// 서버 시작
async function startServer() {
    // 먼저 서버를 시작하고 데이터베이스는 나중에 연결 시도
    app.listen(PORT, () => {
        console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
        console.log(`API 문서: http://localhost:${PORT}`);
    });

    // 데이터베이스 연결 시도 (실패해도 서버는 계속 실행)
    try {
        await connectDB();
        console.log("데이터베이스 연결 성공");

        // 데이터베이스 초기화 시도
        try {
            const { initializeDatabase } = require("./database/init");
            await initializeDatabase();
            console.log("데이터베이스 테이블 초기화 완료");
        } catch (initError) {
            console.warn(
                "데이터베이스 초기화 건너뜀 (이미 초기화되었거나 권한 없음):",
                initError.message
            );
        }
    } catch (error) {
        console.error("데이터베이스 연결 실패:", error);
        console.log(
            "데이터베이스 없이 서버가 실행됩니다. Railway에서 PostgreSQL 서비스를 추가해주세요."
        );
        console.log(
            "환경변수 확인: DATABASE_URL =",
            process.env.DATABASE_URL ? "설정됨" : "설정되지 않음"
        );
    }
}

startServer();

module.exports = app;
