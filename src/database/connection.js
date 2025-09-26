const { Pool } = require("pg");

let pool;

// 데이터베이스 연결 풀 생성
function createPool() {
    // Railway에서는 DATABASE_URL을 제공하므로 우선적으로 사용
    if (process.env.DATABASE_URL) {
        console.log("DATABASE_URL을 사용하여 PostgreSQL에 연결합니다...");
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl:
                process.env.NODE_ENV === "production"
                    ? { rejectUnauthorized: false }
                    : false,
        });
    }

    // 로컬 개발환경용 설정
    console.log("로컬 환경변수를 사용하여 PostgreSQL에 연결합니다...");
    const config = {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "document_api",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
    };

    console.log(`연결 정보: ${config.host}:${config.port}/${config.database}`);
    return new Pool(config);
}

// 데이터베이스 연결 함수
async function connectDB() {
    try {
        if (!pool) {
            pool = createPool();
        }

        // 연결 테스트
        const client = await pool.connect();
        await client.query("SELECT NOW()");
        client.release();

        console.log("PostgreSQL 데이터베이스 연결 성공");
        return pool;
    } catch (error) {
        console.error("데이터베이스 연결 실패:", error);
        throw error;
    }
}

// 쿼리 실행 함수
async function query(text, params) {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error("쿼리 실행 오류:", error);
        throw error;
    }
}

// 연결 종료 함수
async function closeConnection() {
    if (pool) {
        await pool.end();
        console.log("데이터베이스 연결이 종료되었습니다.");
    }
}

module.exports = {
    connectDB,
    query,
    closeConnection,
    getPool: () => pool,
};
