const { Pool } = require("pg");

let pool;

// 데이터베이스 연결 풀 생성
function createPool() {
    // 1순위: Railway에서 자동 설정되는 DATABASE_URL 사용
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

    // 2순위: 개별 환경변수 사용 (Railway Variables에서 수동 설정)
    if (process.env.DB_HOST) {
        console.log("개별 환경변수를 사용하여 PostgreSQL에 연결합니다...");
        const config = {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        };

        console.log(
            `연결 정보: ${config.host}:${config.port}/${config.database}`
        );
        return new Pool(config);
    }

    // 3순위: 로컬 개발환경용 기본값
    console.log("로컬 개발환경 기본값을 사용하여 PostgreSQL에 연결합니다...");
    const config = {
        host: "localhost",
        port: 5432,
        database: "document_api",
        user: "postgres",
        password: "password",
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
