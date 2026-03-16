const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "autoschool",
  });

  try {
    const [tables] = await connection.execute("SHOW TABLES LIKE 'price%'");
    console.log("Существующие таблицы цен:", tables);

    if (tables.length > 0) {
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`\nСтруктура таблицы ${tableName}:`);
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.table(columns);
      }
    }
  } catch (error) {
    console.error("Ошибка:", error.message);
  } finally {
    await connection.end();
  }
}

checkTables();
