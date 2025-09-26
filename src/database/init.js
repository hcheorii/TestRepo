const fs = require("fs");
const path = require("path");
const { connectDB, query, closeConnection } = require("./connection");

async function initializeDatabase() {
    try {
        console.log("데이터베이스 초기화를 시작합니다...");

        // 데이터베이스 연결
        await connectDB();

        // 스키마 파일 읽기
        const schemaPath = path.join(__dirname, "schema.sql");
        const schemaSQL = fs.readFileSync(schemaPath, "utf8");

        // 스키마 실행
        await query(schemaSQL);
        console.log("데이터베이스 스키마가 성공적으로 생성되었습니다.");

        // uploads 디렉토리 생성
        const uploadsDir = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log("uploads 디렉토리가 생성되었습니다.");
        }

        console.log("데이터베이스 초기화가 완료되었습니다.");
    } catch (error) {
        console.error("데이터베이스 초기화 실패:", error);
        process.exit(1);
    } finally {
        await closeConnection();
    }
}

// 스크립트가 직접 실행될 때만 초기화 실행
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
