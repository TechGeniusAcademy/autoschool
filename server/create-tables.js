const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

async function executeSQLFile() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "autoschool",
    charset: "utf8mb4",
  });

  console.log("Подключение к базе данных...");

  try {
    const sql = fs.readFileSync("./create_prices_tables.sql", "utf8");
    const statements = sql.split(";").filter((s) => s.trim() !== "");

    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Выполняется:", statement.substring(0, 50) + "...");
        await connection.execute(statement);
      }
    }

    console.log("✅ Таблицы цен успешно созданы!");
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  } finally {
    await connection.end();
  }
}

executeSQLFile();
