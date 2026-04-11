import postgres from 'postgres';

declare global {
  // eslint-disable-next-line no-var
  var _pgSql: postgres.Sql | undefined;
}

// Singleton to avoid creating multiple connections in dev (Next.js hot reload)
const sql: postgres.Sql =
  globalThis._pgSql ??
  postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgSql = sql;
}

export default sql;
