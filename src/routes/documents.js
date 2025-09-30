const express = require("express");
const path = require("path");
const fs = require("fs");
const { query } = require("../database/connection");
const { upload, handleUploadError } = require("../config/multer");

// 데이터베이스 연결 확인 미들웨어
const checkDatabaseConnection = async (req, res, next) => {
    try {
        await query("SELECT 1");
        next();
    } catch (error) {
        console.error("데이터베이스 연결 확인 실패:", error);
        res.status(503).json({
            error: "데이터베이스 서비스를 사용할 수 없습니다.",
            message:
                "Railway에서 PostgreSQL 서비스가 설정되지 않았거나 연결할 수 없습니다.",
            instructions: [
                "1. Railway 대시보드에서 PostgreSQL 서비스를 추가해주세요.",
                "2. DATABASE_URL 환경변수가 자동으로 설정되었는지 확인해주세요.",
                "3. 배포 후 데이터베이스 초기화: npm run init-db",
            ],
        });
    }
};

const router = express.Router();

// 문서 업로드 API
router.post(
    "/upload",
    checkDatabaseConnection,
    upload.single("document"),
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "업로드할 파일이 없습니다.",
                });
            }

            const {
                originalname,
                filename,
                path: filePath,
                size,
                mimetype,
            } = req.file;
            const { description, tags } = req.body;

            // 한글 파일명 인코딩 문제 해결
            let decodedOriginalName;
            try {
                // 브라우저에서 전송된 파일명이 잘못 인코딩된 경우를 처리
                decodedOriginalName = Buffer.from(
                    originalname,
                    "latin1"
                ).toString("utf8");
                // UTF-8 디코딩 결과가 유효하지 않으면 원본 사용
                if (decodedOriginalName.includes("�")) {
                    decodedOriginalName = originalname;
                }
            } catch (error) {
                console.log("파일명 디코딩 실패, 원본 사용:", originalname);
                decodedOriginalName = originalname;
            }

            // 태그 처리 (문자열을 배열로 변환)
            let tagsArray = [];
            if (tags) {
                try {
                    tagsArray =
                        typeof tags === "string" ? JSON.parse(tags) : tags;
                } catch (e) {
                    // JSON 파싱 실패시 쉼표로 분리
                    tagsArray = tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag);
                }
            }

            // 데이터베이스에 문서 정보 저장
            const insertQuery = `
      INSERT INTO documents (filename, original_filename, file_path, file_size, mime_type, description, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

            const result = await query(insertQuery, [
                filename,
                decodedOriginalName,
                `/uploads/${filename}`,
                size,
                mimetype,
                description || null,
                tagsArray,
            ]);

            const document = result.rows[0];

            res.status(201).json({
                message: "문서가 성공적으로 업로드되었습니다.",
                document: {
                    id: document.id,
                    originalName: document.original_filename,
                    fileName: document.filename,
                    size: document.file_size,
                    mimeType: document.mime_type,
                    description: document.description,
                    tags: document.tags,
                    uploadDate: document.upload_date,
                    imageUrl: `${req.protocol}://${req.get("host")}/uploads/${
                        document.filename
                    }`,
                },
            });
        } catch (error) {
            console.error("문서 업로드 오류:", error);

            // 업로드된 파일이 있다면 삭제
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error("임시 파일 삭제 실패:", unlinkError);
                }
            }

            res.status(500).json({
                error: "문서 업로드 중 오류가 발생했습니다.",
                details:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// 문서 목록 조회 API
router.get("/", checkDatabaseConnection, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = "upload_date",
            order = "DESC",
            search,
            mimeType,
            tag,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // 기본 쿼리
        let selectQuery = `
      SELECT 
        id, 
        filename, 
        original_filename, 
        file_size, 
        mime_type, 
        description, 
        tags, 
        upload_date,
        created_at,
        updated_at
      FROM documents 
      WHERE is_active = true
    `;

        const queryParams = [];
        let paramIndex = 1;

        // 검색 조건 추가
        if (search) {
            selectQuery += ` AND (original_filename ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        if (mimeType) {
            selectQuery += ` AND mime_type = $${paramIndex}`;
            queryParams.push(mimeType);
            paramIndex++;
        }

        if (tag) {
            selectQuery += ` AND $${paramIndex} = ANY(tags)`;
            queryParams.push(tag);
            paramIndex++;
        }

        // 정렬 및 페이지네이션
        const allowedSortFields = [
            "upload_date",
            "original_filename",
            "file_size",
            "created_at",
        ];
        const sortField = allowedSortFields.includes(sort)
            ? sort
            : "upload_date";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        selectQuery += ` ORDER BY ${sortField} ${sortOrder}`;
        selectQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(parseInt(limit), offset);

        // 총 개수 조회 쿼리
        let countQuery = `SELECT COUNT(*) FROM documents WHERE is_active = true`;
        const countParams = [];
        let countParamIndex = 1;

        if (search) {
            countQuery += ` AND (original_filename ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
            countParamIndex++;
        }

        if (mimeType) {
            countQuery += ` AND mime_type = $${countParamIndex}`;
            countParams.push(mimeType);
            countParamIndex++;
        }

        if (tag) {
            countQuery += ` AND $${countParamIndex} = ANY(tags)`;
            countParams.push(tag);
            countParamIndex++;
        }

        // 쿼리 실행
        const [documentsResult, countResult] = await Promise.all([
            query(selectQuery, queryParams),
            query(countQuery, countParams),
        ]);

        const documents = documentsResult.rows.map((doc) => ({
            id: doc.id,
            originalName: doc.original_filename,
            fileName: doc.filename,
            size: doc.file_size,
            mimeType: doc.mime_type,
            description: doc.description,
            tags: doc.tags,
            uploadDate: doc.upload_date,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at,
            imageUrl: `${req.protocol}://${req.get("host")}/uploads/${
                doc.filename
            }`,
        }));

        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            documents,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1,
            },
        });
    } catch (error) {
        console.error("문서 목록 조회 오류:", error);
        res.status(500).json({
            error: "문서 목록을 조회하는 중 오류가 발생했습니다.",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

// 특정 문서 조회 API
router.get("/:id", checkDatabaseConnection, async (req, res) => {
    try {
        const { id } = req.params;

        const selectQuery = `
      SELECT 
        id, 
        filename, 
        original_filename, 
        file_path,
        file_size, 
        mime_type, 
        description, 
        tags, 
        upload_date,
        created_at,
        updated_at
      FROM documents 
      WHERE id = $1 AND is_active = true
    `;

        const result = await query(selectQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "문서를 찾을 수 없습니다.",
            });
        }

        const doc = result.rows[0];

        res.json({
            document: {
                id: doc.id,
                originalName: doc.original_filename,
                fileName: doc.filename,
                filePath: doc.file_path,
                size: doc.file_size,
                mimeType: doc.mime_type,
                description: doc.description,
                tags: doc.tags,
                uploadDate: doc.upload_date,
                createdAt: doc.created_at,
                updatedAt: doc.updated_at,
                imageUrl: `${req.protocol}://${req.get("host")}/uploads/${
                    doc.filename
                }`,
            },
        });
    } catch (error) {
        console.error("문서 조회 오류:", error);
        res.status(500).json({
            error: "문서를 조회하는 중 오류가 발생했습니다.",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

// 문서 이미지 조회 API (직접 파일 스트림 제공)
router.get("/:id/image", checkDatabaseConnection, async (req, res) => {
    try {
        const { id } = req.params;

        // 데이터베이스에서 문서 정보 조회
        const selectQuery = `
      SELECT filename, mime_type, original_filename 
      FROM documents 
      WHERE id = $1 AND is_active = true
    `;

        const result = await query(selectQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "문서를 찾을 수 없습니다.",
            });
        }

        const { filename, mime_type, original_filename } = result.rows[0];
        const filePath = path.join(__dirname, "../../uploads", filename);

        // 파일 존재 확인
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "파일을 찾을 수 없습니다.",
            });
        }

        // 파일 정보 설정
        res.setHeader("Content-Type", mime_type);
        res.setHeader("Access-Control-Allow-Origin", "*");

        // PDF 파일인 경우 특별한 처리
        if (mime_type === "application/pdf") {
            res.setHeader("X-Frame-Options", "SAMEORIGIN"); // iframe 허용
            res.setHeader(
                "Content-Security-Policy",
                "frame-ancestors 'self' *"
            ); // CSP 설정
        }

        res.setHeader(
            "Content-Disposition",
            `inline; filename*=UTF-8''${encodeURIComponent(original_filename)}`
        );

        // 파일 스트림 생성 및 전송
        const fileStream = fs.createReadStream(filePath);

        fileStream.on("error", (error) => {
            console.error("파일 스트림 오류:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: "파일을 읽는 중 오류가 발생했습니다.",
                });
            }
        });

        fileStream.pipe(res);
    } catch (error) {
        console.error("이미지 조회 오류:", error);
        if (!res.headersSent) {
            res.status(500).json({
                error: "이미지를 조회하는 중 오류가 발생했습니다.",
                details:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
});

// 문서 삭제 API (소프트 삭제)
router.delete("/:id", checkDatabaseConnection, async (req, res) => {
    try {
        const { id } = req.params;

        const updateQuery = `
      UPDATE documents 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, original_filename
    `;

        const result = await query(updateQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "문서를 찾을 수 없습니다.",
            });
        }

        res.json({
            message: "문서가 성공적으로 삭제되었습니다.",
            deletedDocument: {
                id: result.rows[0].id,
                originalName: result.rows[0].original_filename,
            },
        });
    } catch (error) {
        console.error("문서 삭제 오류:", error);
        res.status(500).json({
            error: "문서를 삭제하는 중 오류가 발생했습니다.",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

module.exports = router;
