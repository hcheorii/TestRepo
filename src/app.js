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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (업로드된 이미지용)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
    try {
        await connectDB();
        console.log("데이터베이스 연결 성공");

        app.listen(PORT, () => {
            console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
            console.log(`API 문서: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("서버 시작 실패:", error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
