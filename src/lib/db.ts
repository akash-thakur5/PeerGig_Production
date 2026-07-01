import postgres from 'postgres';

declare global {
  // eslint-disable-next-line no-var
  var _pgSql: postgres.Sql | undefined;
}

const isProduction = process.env.NODE_ENV === 'production';

// Singleton to avoid creating multiple connections in dev (Next.js hot reload)
const sql: postgres.Sql =
  globalThis._pgSql ??
  postgres(process.env.DATABASE_URL!, {
    max: isProduction ? 3 : 10,        // Vercel serverless = fewer connections
    idle_timeout: isProduction ? 20 : 30,
    connect_timeout: 10,
    ssl: isProduction ? 'require' : false, // Neon.tech requires SSL
    prepare: isProduction ? false : true,  // Required for Neon connection pooler
  });

if (!isProduction) {
  globalThis._pgSql = sql;
}

export default sql;
