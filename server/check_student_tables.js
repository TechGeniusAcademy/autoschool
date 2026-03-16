const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkUserTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("=== Структура таблицы users ===");
    const [usersDesc] = await connection.execute("DESCRIBE users");
    console.table(usersDesc);

    console.log("\n=== Пример записи студента из users ===");
    const [studentExample] = await connection.execute("SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE role = ? LIMIT 1", ["student"]);
    console.table(studentExample);

    await connection.end();
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}

checkUserTable();
