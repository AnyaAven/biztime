/** Database setup for BizTime. */

import pg from "pg";
const { Client } = pg;

const DB_URI = process.env.NODE_ENV === "test"
  ? "postgresql:///biztime_test"
  : "postgresql:///biztime";

const db = new Client({
  connectionString: DB_URI,
});

await db.connect();

export default db;