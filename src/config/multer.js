const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // UUID를 사용하여 고유한 파일명 생성
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// 파일 필터 설정
const fileFilter = (req, file, cb) => {
    const allowedTypes = (
        process.env.ALLOWED_FILE_TYPES ||
        "image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
    ).split(",");

    console.log(`업로드 파일 타입: ${file.mimetype}, 원본 파일명: ${file.originalname}`);

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `지원하지 않는 파일 형식입니다. 허용된 형식: ${allowedTypes.join(
                    ", "
                )}`
            ),
            false
        );
    }
};

// Multer 설정
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 기본 10MB
        files: 1, // 한 번에 하나의 파일만 업로드
    },
});

// 에러 핸들링 미들웨어
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({
                    error: "파일 크기가 너무 큽니다.",
                    maxSize: `${
                        (parseInt(process.env.MAX_FILE_SIZE) || 10485760) /
                        1024 /
                        1024
                    }MB`,
                });
            case "LIMIT_FILE_COUNT":
                return res.status(400).json({
                    error: "파일 개수가 제한을 초과했습니다.",
                });
            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({
                    error: "예상하지 못한 파일 필드입니다.",
                });
            default:
                return res.status(400).json({
                    error: "파일 업로드 중 오류가 발생했습니다.",
                    details: error.message,
                });
        }
    }

    if (error.message.includes("지원하지 않는 파일 형식")) {
        return res.status(400).json({
            error: error.message,
        });
    }

    next(error);
};

module.exports = {
    upload,
    handleUploadError,
};
