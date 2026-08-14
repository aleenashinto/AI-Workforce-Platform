const postgres = require("postgres");

const sql = postgres({
  host: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "ai_workforce",
  ssl: false,
});

async function test() {
  try {
    const result = await sql.unsafe(
      "SELECT current_database(), current_user"
    );

    console.log("SUCCESS:");
    console.log(result);
  } catch (error) {
    console.error("FAILED:");
    console.error(error);
  } finally {
    await sql.end();
  }
}

test();